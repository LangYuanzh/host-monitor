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
                        <el-button type="primary" icon="el-icon-search" @click="getData"class="handle-listall">显示全部</el-button>
                        <el-button
                                type="primary"
                                icon="el-icon-circle-plus-outline"

                                @click="handleInsert"
                        >添加主机</el-button>
                    </div>
                    <el-table
                            :data="tableData"
                            border
                            class="table"
                            ref="multipleTable"
                            header-cell-class-name="table-header"
                            @selection-change="handleSelectionChange"
                    >
                        <el-table-column type="selection" width="50" align="center"></el-table-column>
                        <el-table-column label="序号" width="55" align="center">
                            <template slot-scope="scope">{{scope.$index+1}}</template>
                        </el-table-column>
                        <el-table-column prop="groupName" label="组别" width="55" align="center"></el-table-column>
                        <el-table-column prop="ip" label="ip" align="center"></el-table-column>
                        <el-table-column prop="givenName" label="别名" align="center"></el-table-column>
                        <el-table-column prop="osName" label="操作系统" align="center"></el-table-column>
                        <el-table-column label="处理器" align="center">
                            <template slot-scope="scope">{{scope.row.cores}}核</template>
                        </el-table-column>
                        <el-table-column label="内存" align="center">
                            <template slot-scope="scope">{{scope.row.totalMemorySize}}G</template>
                        </el-table-column>
                        <el-table-column label="磁盘" align="center">
                            <template slot-scope="scope">{{scope.row.totalDiskSpace}}G</template>
                        </el-table-column>
                        <el-table-column label="状态" align="center">
                            <template slot-scope="scope">
                                <el-tag
                                        :type="scope.row.isDeploy==='running'?'success':(scope.row.isDeploy==='stop'?'danger':'')"
                                >{{scope.row.isDeploy}}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180" align="center">
                            <template slot-scope="scope">
                                <el-button
                                        type="text"
                                        icon="el-icon-edit"
                                        @click="handleEdit(scope.$index, scope.row)"
                                >编辑</el-button>
                                <el-button
                                        type="text"
                                        icon="el-icon-delete"
                                        class="red"
                                        @click="handleDelete(scope.$index, scope.row)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination
                                background
                                layout="total, prev, pager, next"
                                :current-page="query.pageIndex"
                                :page-size="query.pageSize"
                                :total="pageTotal"
                                @current-change="handlePageChange"
                        ></el-pagination>
                    </div>
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
                        <el-button @click="insertVisible = false">取 消</el-button>
                        <el-button type="primary" @click="saveInsert">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-row>
    </div>
</template>

<script>
    import Schart from 'vue-schart';
    import { tableInit } from '../../api/index';
    import { hostSearch } from '../../api/index';
    import { hostDelete } from '../../api/index';
    import { hostUpdate } from '../../api/index';
    import { hostInsert } from '../../api/index';
    import bus from '../common/bus';
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
                tableData: [],
                multipleSelection: [],
                delList: [],
                editVisible: false,
                insertVisible: false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
            };
        },
        components: {
            Schart
        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created() {
            this.getData();
        },

        methods: {
            changeDate() {
                const now = new Date().getTime();
                this.data.forEach((item, index) => {
                    const date = new Date(now - (6 - index) * 86400000);
                    item.name = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                });
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                tableInit(this.query).then(res => {
                    this.tableData = res.data;
                    this.pageTotal = this.tableData.length;
                });
            },
            // 触发搜索按钮
            handleSearch() {
                hostSearch(this.query).then(res => {
                    this.tableData = res.data;
                    this.pageTotal = this.tableData.length;
                });
            },
            // 删除操作
            handleDelete(index, row) {
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        hostDelete(row).then(res =>{
                            this.$message.success('删除成功');
                            this.tableData.splice(index, 1);
                            this.pageTotal = this.tableData.length;
                        }).catch(error =>{
                            this.$message.error('删除失败');
                        });

                    })
                // .catch(() => { alert("not delete")});
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
            saveInsert(){
                hostInsert(this.form).then(res => {
                    this.insertVisible = false;
                    this.$message.success(`注册成功`);
                    this.form.isDeploy = 'running';
                    this.tableData.push(this.form);
                    this.pageTotal = this.tableData.length;
                    //this.$set(this.tableData, this.idx, this.form);
                })
            },
            // 保存编辑
            saveEdit() {
                hostUpdate(this.form).then(res => {
                    this.editVisible = false;
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    this.$set(this.tableData, this.idx, this.form);
                }).catch(() => {
                    this.$message.error(`修改第 ${this.idx + 1} 行失败`);
                })

            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.query, 'pageIndex', val);
                this.getData();
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
        margin-left: 575px
    }
    .mr560 {
        margin-right: 550px;
    }

</style>
