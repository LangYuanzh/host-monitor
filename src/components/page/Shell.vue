<template>
    <div>
        <el-row>
            <div>
                <div class="container">
                    <div class="handle-box">
                        <el-select v-model="query.searchType" placeholder="搜索方式" class="handle-select mr10">
                            <el-option key="1" label="组别" value="groupName"></el-option>
                            <el-option key="2" label="ip地址" value="ip"></el-option>
                            <el-option key="3" label="别名" value="givenName"></el-option>
                        </el-select>
                        <el-input v-model="query.searchValue" placeholder="" class="handle-input mr10"></el-input>
                        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                    </div>
                    <div class="container upload-container">
                        <el-upload
                                class="upload-demo"
                                drag
                                action="/api/upload"
                                multiple
                                name="file"
                                data="query">
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">将文件拖到此处，或<em>上传shell脚本</em></div>
                            <div class="el-upload__tip" slot="tip">只能上传shell脚本文件</div>
                        </el-upload>
                    </div>
                    <el-container style=" border: 1px solid #eee">
                        <el-aside width="400px" style="background-color: rgb(238, 241, 246)">
                            <el-header style="text-align: left; font-size: 12px; background-color: rgb(238, 241, 246)">
                                <el-dropdown>
                                    <i class="el-icon-setting" style="margin-right: 15px"></i>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>查看</el-dropdown-item>
                                        <el-dropdown-item>新增</el-dropdown-item>
                                        <el-dropdown-item>删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <span>执行历史</span>
                            </el-header>
                            <el-collapse v-model="activeNames" @change="handleChange">
                                <el-collapse-item title="shell脚本" align="center" name="1">
                                    <el-table :data="shellData"
                                              :show-header="false"
                                              highlight-current-row
                                              @current-change="handleCurrentChange">
                                        <el-table-column prop="shell1" label="" align="center"></el-table-column>
                                    </el-table>
                                </el-collapse-item>
                                <el-collapse-item title="shell命令" name="2">
                                    <el-table :data="tableData"
                                              :show-header="false"
                                              highlight-current-row
                                              @current-change="handleCurrentChange">
                                        <el-table-column prop="shell2" label="" align="center"></el-table-column>
                                    </el-table>
                                </el-collapse-item>
                            </el-collapse>
                        </el-aside>
                        <el-container>
                            <el-main>
                                <el-table :data="tableData">
                                    <el-table-column prop="excuteDate" label="时间" align="center"></el-table-column>
                                    <el-table-column prop="givenGroup" label="组别" align="center"></el-table-column>
                                    <el-table-column prop="ip"  label="ip地址" align="center"></el-table-column>
                                </el-table>
                            </el-main>
                        </el-container>
                    </el-container>
                </div>
                <!-- 编辑弹出框 -->
                <el-dialog title="修改主机信息" :visible.sync="editVisible" width="30%" align="center">
                    <el-form ref="form" :model="form" label-width="70px">
                        <el-form-item label="组别">
                            <el-input v-model="form.groupName"></el-input>
                        </el-form-item>
                        <el-form-item label="别名">
                            <el-input v-model="form.givenName"></el-input>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="editVisible = false">取 消</el-button>
                        <el-button type="primary" @click="saveEdit">确 定</el-button>
                    </span>
                </el-dialog>
                <!-- 增加弹出框 -->
                <el-dialog title="注册主机信息" :visible.sync="insertVisible" width="30%" align="center">
                    <el-form ref="form" :model="form" label-width="70px">
                        <el-form-item label="组别">
                            <el-input v-model="form.groupName"></el-input>
                        </el-form-item>
                        <el-form-item label="ip地址">
                            <el-input v-model="form.ip"></el-input>
                        </el-form-item>
                        <el-form-item label="别名">
                            <el-input v-model="form.givenName"></el-input>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="editVisible = false">取 消</el-button>
                        <el-button type="primary" @click="saveInsert">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-row>
    </div>
</template>

<script>
    import Schart from 'vue-schart';
    import VueCropper  from 'vue-cropperjs';
    export default {
        name: 'dashboard',
        data() {
            return {
                name: localStorage.getItem('ms_username'),
                query: {
                    searchType: '',
                    searchValue: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                deleteItem:{

                },
                shellData:[
                    {
                        shell1:"daadasddadasdsd"
                    },
                    {
                        shell1:"dasdadsd"
                    },
                    {
                        shell1:"dasad"
                    }

                ],
                tableData: [
                    {
                        id:1,
                        excuteDate: '2016-05-02',
                        givenGroup: '王小虎',
                        ip: '上海市普陀区金沙江路 1518 弄'
                    },
                    {
                        id:2,
                        excuteDate: '2016-05-02',
                        givenGroup: '王小虎',
                        ip: '上海市普陀区金沙江路 1518 弄',
                    }
                ],//Array(20).fill(this.item),
                multipleSelection: [],
                delList: [],
                editVisible: false,
                insertVisible: false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,

                defaultSrc: require('../../assets/img/img.jpg'),
                fileList: [],
                imgSrc: '',
                cropImg: '',
                dialogVisible: false,
            };
        },
        components: {
            Schart,
            VueCropper
        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created() {
        },

        methods: {
            changeDate() {
                const now = new Date().getTime();
                this.data.forEach((item, index) => {
                    const date = new Date(now - (6 - index) * 86400000);
                    item.name = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                });
            },
            handleCurrentChange(val){
                alert(val.shell1);
                this.tableData = [];
            },
            // 多选操作
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            delAllSelection() {
                const length = this.multipleSelection.length;
                let str = '';
                this.delList = this.delList.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error(`删除了${str}`);
                this.multipleSelection = [];
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editVisible = true;
            },
            handleInsert(){
                this.insertVisible = true;
            },
            setImage(e){
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.dialogVisible = true;
                    this.imgSrc = event.target.result;
                    this.$refs.cropper && this.$refs.cropper.replace(event.target.result);
                };
                reader.readAsDataURL(file);
            },
            cropImage () {
                this.cropImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
            },
            cancelCrop(){
                this.dialogVisible = false;
                this.cropImg = this.defaultSrc;
            },
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
    .table {
        width: 100%;
        font-size: 14px;
    }
    .red {
        color: #ff0000;
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
    .view-all{
        margin-left: 400px
    }

    .el-header {
        background-color: #B3C0D1;
        color: #333;
        line-height: 60px;
    }

    .el-aside {
        color: #333;
    }

    .upload-container{
       margin-bottom: 20px;
    }


</style>
