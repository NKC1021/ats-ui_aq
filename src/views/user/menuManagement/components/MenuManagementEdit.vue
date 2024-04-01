<template>
  <el-dialog
    v-model="state.dialogFormVisible"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    :title="props.title"
    width="800px"
  >
    <!-- <warning-bar :title="t('menu.newMenuNote')" /> -->
    <el-form
      ref="menuForm"
      :inline="true"
      label-position="top"
      label-width="100px"
      :model="form"
      :rules="state.rules"
    >
      <el-form-item
        :label="translate('路由Name')"
        prop="path"
        style="width: 30%"
      >
        <el-input
          v-model="form.name"
          autocomplete="off"
          :placeholder="translate('唯一英文字符串')"
          @change="changeName"
        />
      </el-form-item>
      <el-form-item prop="path" style="width: 30%">
        <template #label>
          <div style="display: inline-flex">
            {{ translate('路由Path') }}
            <el-checkbox
              v-model="checkFlag"
              style="float: right; height: 20px; margin-left: 20px"
            >
              {{ translate('添加参数') }}
            </el-checkbox>
          </div>
        </template>

        <el-input
          v-model="form.path"
          autocomplete="off"
          :disabled="!checkFlag"
          placeholder="建议只在后方拼接"
        />
      </el-form-item>
      <el-form-item :label="translate('是否隐藏')" style="width: 30%">
        <el-select
          v-model="form.hidden"
          :placeholder="translate('是否在列表隐藏')"
          style="width: 100%"
        >
          <el-option :label="translate('否')" :value="false" />
          <el-option :label="translate('是')" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item :label="translate('父节点ID')" style="width: 30%">
        <el-cascader
          v-model="form.parentId"
          :disabled="!isEdit"
          filterable
          :options="menuOption"
          :props="{
            checkStrictly: true,
            label: 'title',
            value: 'id',
            disabled: 'disabled',
            emitPath: false,
          }"
          :show-all-levels="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        :label="translate('文件路径')"
        prop="component"
        style="width: 63%"
      >
        <el-input
          v-model="form.component"
          autocomplete="off"
          placeholder="页面:view/xxx/xx.vue 插件:plugin/xx/xx.vue"
          @blur="fmtComponent"
        />
        <span style="margin-right: 12px; font-size: 12px">
          {{
            translate('如果菜单包含子菜单，请创建router-view二级路由页面或者')
          }}
        </span>
        <el-button
          size="small"
          style="margin-top: 4px"
          @click="form.component = 'view/routerHolder.vue'"
        >
          {{ translate('点我设置') }}
        </el-button>
      </el-form-item>
      <el-form-item
        :label="translate('展示名称')"
        prop="title"
        style="width: 30%"
      >
        <el-input v-model="form.title" autocomplete="off" />
      </el-form-item>
      <el-form-item :label="translate('图标')" prop="icon" style="width: 30%">
        <icon v-model:meta="form.icon" style="width: 100%" />
      </el-form-item>
      <el-form-item
        :label="translate('排序标记')"
        prop="sort"
        style="width: 30%"
      >
        <el-input v-model.number="form.sort" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="activeName" style="width: 30%">
        <template #label>
          <div>
            <span>{{ translate('高亮菜单') }}</span>
            <el-tooltip
              content="注：当到达此路由时候，指定左侧菜单指定name会处于活跃状态（亮起），可为空，为空则为本路由Name。"
              effect="light"
              placement="top"
            >
              <span>
                <el-icon><QuestionFilled /></el-icon>
              </span>
            </el-tooltip>
          </div>
        </template>
        <el-input
          v-model="form.activeName"
          autocomplete="off"
          :placeholder="form.name"
        />
      </el-form-item>
      <el-form-item label="KeepAlive" prop="keepAlive" style="width: 30%">
        <el-select
          v-model="form.keepAlive"
          :placeholder="translate('是否keepAlive缓存页面')"
          style="width: 100%"
        >
          <el-option :label="translate('否')" :value="false" />
          <el-option :label="translate('是')" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item label="CloseTab" prop="closeTab" style="width: 30%">
        <el-select
          v-model="form.closeTab"
          :placeholder="translate('是否自动关闭tab')"
          style="width: 100%"
        >
          <el-option :label="translate('否')" :value="false" />
          <el-option :label="translate('是')" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item style="width: 30%">
        <template #label>
          <div>
            <span>{{ translate('是否为基础页面') }}</span>
            <el-tooltip
              :content="
                translate('此项选择为是，则不会展示左侧菜单以及顶部信息。')
              "
              effect="light"
              placement="top"
            >
              <span>
                <el-icon><QuestionFilled /></el-icon>
              </span>
            </el-tooltip>
          </div>
        </template>

        <el-select
          v-model="form.defaultMenu"
          :placeholder="translate('是否为基础页面')"
          style="width: 100%"
        >
          <el-option :label="translate('否')" :value="false" />
          <el-option :label="translate('是')" :value="true" />
        </el-select>
      </el-form-item>
    </el-form>
    <div>
      <el-button
        icon="edit"
        size="small"
        type="primary"
        @click="addParameter(form)"
      >
        {{ translate('新增菜单参数') }}
      </el-button>
      <el-table :data="form.parameters" style="width: 100%">
        <el-table-column
          align="left"
          :label="translate('参数类型')"
          prop="type"
          width="180"
        >
          <template #default="scope">
            <el-select
              v-model="scope.row.type"
              :placeholder="translate('请选择')"
            >
              <el-option key="query" label="query" value="query" />
              <el-option key="params" label="params" value="params" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          :label="translate('参数key')"
          prop="key"
          width="180"
        >
          <template #default="scope">
            <div>
              <el-input v-model="scope.row.key" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" :label="translate('参数值')" prop="value">
          <template #default="scope">
            <div>
              <el-input v-model="scope.row.value" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left">
          <template #default="scope">
            <div>
              <el-button
                icon="delete"
                size="small"
                type="danger"
                @click="deleteParam(form.parameters, scope.$index)"
              >
                {{ translate('删除') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-button
        icon="edit"
        size="small"
        style="margin-top: 12px"
        type="primary"
        @click="addBtn(form)"
      >
        {{ translate('新增可控制按钮') }}
      </el-button>
      <el-table :data="form.menuBtn" style="width: 100%">
        <el-table-column
          align="left"
          :label="translate('按钮名称')"
          prop="name"
          width="180"
        >
          <template #default="scope">
            <div>
              <el-input v-model="scope.row.name" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          :label="translate('备注')"
          prop="name"
          width="180"
        >
          <template #default="scope">
            <div>
              <el-input v-model="scope.row.desc" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left">
          <template #default="scope">
            <div>
              <el-button
                icon="delete"
                size="small"
                type="danger"
                @click="deleteBtn(form.menuBtn, scope.$index)"
              >
                {{ translate('删除') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">{{ translate('取消') }}</el-button>
        <el-button type="primary" @click="save">
          {{ translate('确定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { translate } from '@/i18n'
  import { addBaseMenu, updateBaseMenu } from '@/api/menuManagement'
  import icon from './icon.vue'
  import { reactive, ref, watch } from 'vue'
  const emits = defineEmits(['fetch-data'])
  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    menuTable: {
      type: Array,
      default: () => {
        return []
      },
    },
  })
  watch(
    () => props.title,
    (newVal) => {
      if (newVal === '新增菜单') {
        isEdit.value = false
      }
      if (newVal === '编辑菜单') {
        isEdit.value = true
      }
    }
  )
  const $baseMessage = inject('$baseMessage')
  const checkFlag = ref(false)
  const isEdit = ref(false)
  const form = ref({
    id: 0,
    path: '',
    name: '',
    hidden: false,
    parentId: '', //todo
    component: '',
    activeName: '',
    title: '',
    icon: '',
    defaultMenu: false,
    closeTab: false,
    keepAlive: false,
    parameters: [],
    menuBtn: [],
    sort: null,
  })
  /**
   * 获取form Dom节点
   */
  const menuForm = ref(null)
  /**
   * 初始化数据
   */
  const initForm = () => {
    checkFlag.value = false
    menuForm.value.resetFields()
    form.value = {
      id: 0,
      path: '',
      name: '',
      hidden: false,
      parentId: '',
      component: '',
      title: '',
      icon: '',
      defaultMenu: false,
      closeTab: false,
      keepAlive: false,
      parameters: [],
      menuBtn: [],
      sort: 0,
    }
    form.value.menuBtn = [] // 添加清空 menuBtn 的代码
  }
  const state = reactive({
    rules: {
      path: [
        {
          required: true,
          message: '请输入菜单name',
          trigger: 'blur',
        },
      ],
      component: [
        {
          required: true,
          message: '请输入文件路径',
          trigger: 'blur',
        },
      ],
      title: [
        {
          required: true,
          message: '请输入菜单展示名称',
          trigger: 'blur',
        },
      ],
    },
    dialogTitle: '',
    dialogFormVisible: false,
  })
  /**
   * @param {Object} row 表格数据
   * @param {String} type 操作类型 edit/add
   */
  const showEdit = (row, type) => {
    // 添加子菜单需要知道父节点
    if (row) {
      if (type === 'edit') {
        const _tempObj = Object.assign(row, { ...row.meta })
        Object.keys(form.value).forEach((key) => {
          form.value[key] = _tempObj[key]
        })
      }
      if (type === 'add') {
        form.value.parentId = String(row.id)
      }
    } else {
      form.value.parentId = '0'
    }
    state.dialogFormVisible = true
  }
  const save = () => {
    menuForm.value.validate(async (valid) => {
      if (valid) {
        if (props.title === '新增菜单') {
          const { msg } = await addBaseMenu(form.value)
          $baseMessage(msg, 'success', 'vab-hey-message-success')
          emits('fetch-data')
          closeDialog()
        }
        if (props.title === '编辑菜单') {
          const { msg } = await updateBaseMenu(form.value)
          $baseMessage(msg, 'success', 'vab-hey-message-success')
          emits('fetch-data')
          closeDialog()
        }
      }
    })
  }
  const closeDialog = () => {
    initForm()
    form.value.menuBtn = [] // 清空可控制按钮数组
    state.dialogFormVisible = false
  }
  const deleteBtn = (menuBtn, index) => {
    menuBtn.splice(index, 1)
  }
  const deleteParam = (menuParam, index) => {
    menuParam.splice(index, 1)
  }
  const changeName = () => {
    form.value.path = form.value.name
  }
  const menuOption = ref([
    {
      id: '0',
      title: '根菜单',
    },
  ])
  const setOptions = () => {
    menuOption.value = [
      {
        id: '0',
        title: '根目录',
      },
    ]

    setMenuOptions(props.menuTable, menuOption.value, false)
  }
  const setMenuOptions = (menuData, optionsData, disabled) => {
    menuData &&
      menuData.forEach((item) => {
        if (item.children && item.children.length) {
          const option = {
            title: item.meta.title,
            id: String(item.id),
            disabled: disabled || item.id === form.value.id,
            children: [],
          }
          setMenuOptions(
            item.children,
            option.children,
            disabled || item.id === form.value.id
          )
          optionsData.push(option)
        } else {
          const option = {
            title: item.meta.title,
            id: String(item.id),
            disabled: disabled || item.id === form.value.id,
          }
          optionsData.push(option)
        }
      })
  }
  const fmtComponent = () => {
    form.value.component = form.value.component.replace(/\\/g, '/')
  }
  // 新增参数
  const addParameter = (form) => {
    if (!form.parameters) {
      form.parameters = []
    }
    form.parameters.push({
      type: 'query',
      key: '',
      value: '',
    })
  }
  // 新增可控按钮
  const addBtn = (form) => {
    if (!form.menuBtn) {
      form.menuBtn = []
    }
    form.menuBtn.push({
      name: '',
      desc: '',
    })
  }

  defineExpose({
    showEdit,
    setOptions,
  })
</script>
<style scoped lang="scss">
  .warning {
    color: #dc143c;
  }
  .icon-column {
    display: flex;
    align-items: center;
    .el-icon {
      margin-right: 8px;
    }
  }

  .el-dialog {
    padding: 12px;
    .el-dialog__body {
      padding: 12px 6px;
    }
    .el-dialog__header {
      padding: 2px 20px 10px 20px;
    }
    .el-dialog__footer {
      padding: 0 16px 16px 0;
    }
  }
  .el-form--inline {
    .el-form-item {
      margin-right: 24px;
    }
  }
</style>
