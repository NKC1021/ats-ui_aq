<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :show-close="false"
      :title="titleName"
      width="650px"
    >
      <el-form
        ref="authRef"
        label-width="100px"
        :model="authForm"
        :rules="authorRules"
      >
        <el-form-item :label="translate('用户名')" prop="authorizedUserIds">
          <el-select
            v-model="authForm.authorizedUserIds"
            :disabled="operateType === 'edit'"
            filterable
            multiple
            :placeholder="translate('支持多userList选/可搜索人员')"
            style="width: 100%"
            @change="userChange"
          >
            <el-checkbox v-model="checked" @change="selectAllUser">
              {{ translate('全选') }}
            </el-checkbox>
            <el-option
              v-for="(item, index) in userList"
              :key="index"
              :label="item.userName"
              :value="item.id"
            >
              <div class="userInfoShow">
                <div>
                  {{ item.userName }}
                  <el-tag v-for="(el, i) in item.roleList" :key="i" plain>
                    {{ el.roleName }}
                  </el-tag>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="translate('权限')" prop="permissionType">
          <el-select
            v-model="authForm.permissionType"
            clearable
            placeholder="请选择权限"
            style="width: 100%"
          >
            <el-option :label="translate('只读')" :value="1" />
            <el-option :label="translate('可编辑')" :value="2" />
            <el-option :label="translate('未被授权')" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item :label="translate('访问期限')" prop="authorizedEndTime">
          <el-date-picker
            v-model="authForm.authorizedEndTime"
            placeholder="请选择日期"
            type="datetime"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          v-show="operateType === 'add'"
          type="primary"
          @click="addAuthorizationSubmit"
        >
          {{ translate('确定') }}
        </el-button>
        <el-button
          v-show="operateType === 'edit'"
          type="primary"
          @click="editUserInfoSubmit"
        >
          {{ translate('确定') }}
        </el-button>
        <el-button @click="dialogBeforeClosed">
          {{ translate('取消') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import projectSetController from '@/api/solutionConfig'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      operateType: {
        type: String,
        default: '',
      },
      allUserList: {
        type: Array,
        default: () => [],
      },
      editUserList: {
        type: Array,
        default: () => [],
      },

      editRowInfo: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:show', 'refreshAuList'],
    data() {
      return {
        authorRules: {
          // 授权规则
          authorizedUserIds: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
          permissionType: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
          authorizedEndTime: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
        },
        detailRule: {
          code: [
            {
              required: true,
              message: translate('必填'),
              trigger: 'change',
            },
          ],
        },

        authForm: {
          authorizedUserIds: [],
          authorizedEndTime: '',
          permissionType: null,
        },
        checked: false,
        detailVis: false,
        detailForm: {
          code: [],
          set: 0,
          cus: [],
          dac: [],
          eng: [],
        },
        searchVal: '',
        tableRowIndex: 0,
      }
    },
    computed: {
      translate() {
        return translate
      },
      userList() {
        return this.allUserList
      },
      titleName() {
        if (this.operateType === 'add') {
          return translate('新增')
        }
        if (this.operateType === 'edit') {
          return translate('编辑')
        }
        return ''
      },
      dialogVisible: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
    },
    watch: {
      editRowInfo(newVal) {
        if (this.operateType === 'edit') {
          // console.log('行数据', newVal)
          const reciveObj = { ...newVal }
          this.authForm.id = reciveObj.id
          this.authForm.authorizedUserIds = [reciveObj.authorizedUserId]
          this.authForm.authorizedEndTime = reciveObj.authorizedEndTime
          this.authForm.permissionType = reciveObj.permissionType
        }
      },
    },
    created() {},
    mounted() {},
    methods: {
      // 弹窗关闭操作
      async dialogBeforeClosed() {
        this.checked = false
        this.authForm = {
          authorizedUserIds: [],
          authorizedEndTime: '',
          permissionType: null,
        }
        this.dialogVisible = false
        this.$refs.authRef.resetFields()
      },
      // 添加授权
      addAuthorizationSubmit() {
        this.$refs.authRef.validate(async (valid) => {
          if (!valid) return
          const query = { ...this.authForm }
          const res = await projectSetController.addProjectAuthInfo(query)
          if (res.code === 0) {
            this.checked = false
            this.$message.success(res.msg)
            this.dialogBeforeClosed()
            this.$emit('refreshAuList')
          }
        })
      },

      // 修改提交
      async editUserInfoSubmit() {
        this.$refs.authRef.validate(async (valid) => {
          if (valid) {
            const query = { ...this.authForm }
            const res = await projectSetController.updateProjectAuthInfo(query)
            if (res.code === 0) {
              this.checked = false
              this.$message.success(res.msg)
              this.dialogBeforeClosed()
              this.$emit('refreshAuList')
            }
          }
        })
      },
      /**
       * 全选用户
       */
      selectAllUser() {
        this.authForm.authorizedUserIds = []
        if (this.checked) {
          this.userList.map((item) => {
            this.authForm.authorizedUserIds.push(item.id)
          })
        } else {
          this.authForm.authorizedUserIds = []
        }
      },
      userChange(val) {
        if (val.length === this.userList.length) {
          this.checked = true
        } else {
          this.checked = false
        }
      },
      radioChange(val) {
        if (val === 2) {
          this.authForm.permissionType = 3
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  .table-border {
    border: 1px solid #ebeef5;
    border-bottom: none;
  }
  .el-checkbox {
    text-align: left;
    width: 100%;
    padding-left: 10px;
    box-sizing: border-box;
  }
  .userInfoShow {
    display: flex;
    align-items: center;
    padding-left: 10px;
    .el-tag {
      margin-left: 5px;
    }
  }
</style>
