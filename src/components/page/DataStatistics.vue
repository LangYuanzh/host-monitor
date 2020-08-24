<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-select v-model="query.searchType" placeholder="搜索方式" class="handle-select mr10">
                    <el-option key="1" label="按分钟统计" value="minute"></el-option>
                    <el-option key="2" label="按小时统计" value="hour"></el-option>
                    <el-option key="2" label="按天统计" value="day"></el-option>
                </el-select>
                <el-input v-model="query.searchValue" placeholder="输入ip地址" class="handle-input mr10"></el-input>
                <el-date-picker
                        v-model="query.timeRange"
                        type="datetimerange"
                        :picker-options="pickerOptions"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        align="right"
                        class="mr10">
                </el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-row :gutter="20">
                <el-col :span="15">
                    <schart ref="line" class="schart" canvasId="line" :options="options2"></schart>
                </el-col>
                <el-col :span="5">
                    <el-form ref="form" :model="form" label-width="80px">
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource">
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource">
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource" @change="agreeChange">
                                <el-radio label="CPU"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource" @change="agreeChange">
                                <el-radio label="内存"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource" @change="agreeChange">
                                <el-radio label="磁盘"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="form.resource" @change="agreeChange">
                                <el-radio label="应用进程"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>

        </div>
    </div>
</template>

<script>
    import Schart from 'vue-schart';
    import { resourceSearch } from '../../api/index';
    export default {
        name: 'baseform',
        components: {
            Schart
        },
        data() {
            return {
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
                value2: '',
                query: {
                    searchType: '',
                    searchValue: '',
                    timeRange:''
                },
                resourceList: [],
                options2: {
                    type: 'line',
                    title: {
                        text: '资源使用情况'
                    },
                    labels: ["时间"],
                    datasets: [
                        {
                            label: 'CPU',
                            data: [0]
                        }
                    ]
                },
                datalist :[],
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    time1: '',
                    date2: '',
                    time2: '',
                    delivery: true,
                    type: ['步步高'],
                    resource: 'CPU',
                    desc: '',
                    options: []
                }
            };
        },
        methods: {
            agreeChange(){
                this.datalist=[];
                this.resourceList.forEach((item, index) => {
                    if(this.form.resource=='内存'){
                        this.datalist.push(item.usedMemorySize);
                    }
                    if(this.form.resource=='CPU'){
                        this.datalist.push(parseFloat(item.userUsage));
                    }
                    if(this.form.resource=='磁盘'){
                        this.datalist.push(item.freeDiskSpace);
                    }if(this.form.resource=='应用进程'){
                        this.datalist.push(item.processList.length);
                    }
                });
                var labelName="标签"
                if(this.form.resource=='内存'){
                    labelName="已用内存(G)";
                }if(this.form.resource=='CPU'){
                    labelName="CPU使用率(%)";
                }if(this.form.resource=='磁盘'){
                    labelName="已用磁盘(G)";
                }if(this.form.resource=='应用进程'){
                    labelName="进程数量(个)";
                }
                this.options2.datasets = [
                    {
                        label: labelName,
                        data: this.datalist
                    }
                ];
            },
            handleSearch() {
                resourceSearch(this.query).then(res => {
                    this.resourceList = res.data.data;
                    console.log(this.resourceList)
                    this.datalist=[];
                    this.options2.labels = [];
                    for (var value of this.resourceList) {
                        console.log(value)
                        if(this.form.resource=='内存'){
                            this.datalist.push(value.usedMemorySize);}
                        if(this.form.resource=='CPU'){
                            this.datalist.push(parseFloat(value.userUsage));}
                        if(this.form.resource=='磁盘'){
                            this.datalist.push(value.freeDiskSpace);}
                        if(this.form.resource=='应用进程'){
                            this.datalist.push(item.processList.length);
                        }
                        this.options2.labels.push(value.date)
                    }
                    var labelName="标签"
                    if(this.form.resource=='内存'){
                        labelName="已用内存(G)";
                    }if(this.form.resource=='CPU'){
                        labelName="CPU使用率(%)";
                    }if(this.form.resource=='磁盘'){
                        labelName="已用磁盘(G)";
                    }if(this.form.resource=='应用进程'){
                        labelName="进程数量(个)";
                    }
                    this.options2.datasets = [
                        {
                            label: labelName,
                            data: this.datalist
                        }
                    ]
                });
            },


            onSubmit() {
                this.$message.success('提交成功！');
            }
        }
    };
</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .mr10 {
        margin-right: 10px;
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .schart-box {
        display: inline-block;
        margin: 20px;
    }
    .schart {
        width: 800px;
        height: 400px;
    }
    .m20{
        margin-left: 350px;
    }

</style>
