<template>
  <div class="labeltree-content">
    <el-form>
      <el-form-item :label="translate('标签结构')" label-width="75px">
        <el-cascader
          ref="cascaderRef"
          v-model="labelStructVal"
          :options="_options"
          :props="defaultProps"
          style="width: 100%"
          @change="handleChange"
        />
      </el-form-item>
    </el-form>
    <el-row style="margin-bottom: 5px">
      <el-col class="search-left" :span="12">
        <!-- @click="changeLabelAsideOrder()" -->
        <el-button
          class="query-label-title"
          link
          type="primary"
          @click="changeLabelAsideOrder"
        >
          {{ translate('排序') }}
          <i class="el-icon-d-caret"></i>
        </el-button>
        <!-- @change="labelAsideChangeClickFlag && changeOrderType()" -->
        <el-radio-group v-model="orderType">
          <el-radio :label="0">{{ translate('名称') }}</el-radio>
          <el-radio :label="1">{{ translate('数量') }}</el-radio>
        </el-radio-group>
      </el-col>
      <el-col class="search-right" :span="12">
        <el-button
          icon="el-icon-refresh-left"
          type="primary"
          @click="resetLabelTreeCheck"
        >
          {{ translate('重置') }}
        </el-button>
        <el-tooltip
          :content="translate('刷新筛选树')"
          effect="dark"
          placement="top"
        >
          <el-button
            icon="el-icon-refresh"
            type="primary"
            @click="labelTreeRefresh"
          >
            {{ translate('刷新') }}
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin-bottom: 5px">
      <el-col :span="7">
        <el-select
          v-model="labelSearchTypeValue"
          @blur="blurMethod"
          @change="labelTreeNodeFilterText = ''"
          @focus="focusMethod"
        >
          <el-option
            v-for="item in labelSearchType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="17">
        <el-input
          v-model="labelTreeNodeFilterText"
          :placeholder="labelSearchTypeDesc"
          @blur="blurMethod"
          @focus="focusMethod"
          @keydown.enter="searchImgByName"
        />
      </el-col>
    </el-row>
    <div
      v-loading="labelTreeLoading"
      class="labeltree-body"
      element-loading-:text="translate('请稍候')"
      element-loading-spinner="el-icon-loading"
    >
      <!-- {{ labelAsideData }} -->
      <el-tree
        ref="labelTreeNode"
        :data="labelAsideData"
        :filter-node-method="labelTreeNodeFilter"
        lazy
        :load="loadLabelTreeNode"
        node-key="id"
        :props="defaultProps"
        show-checkbox
        @check="clickLabelTreeCheckBox"
        @check-change="handleCheckChange"
        @node-click="clickLabelTreeNode"
      />
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionSource from '@/api/solutionSource'
  export default {
    props: {
      modelValue: {
        type: Array,
        default: () => [],
      },
      keyMethodFlag: {
        type: Boolean,
        default: false,
      },
      /**
       * 图片结构点击的条件
       */
      conditionTree: {
        type: Object,
        default: () => {},
      },
      dataSetIds: {
        type: Array,
        default: () => [],
      },
      labelTreeCondition: {
        type: Object,
        default: () => {},
      },
    },
    emits: [
      'update:modelValue',
      'updateLabelTreeConfig',
      'update:keyMethodFlag',
      'saveOrUpdatePickPicExport',
      'update:labelTreeCondition',
      'labelTreeNodeCheck',
    ],
    data() {
      return {
        options: [
          { label: translate('客户缺陷名'), value: 'customerDefect' },
          { label: translate('AI结果'), value: 'labelName' },
          {
            label: translate('AI工程名'),
            value: 'enginName',
            children: [
              { label: translate('工程缺陷名'), value: 'enginDefect' },
            ],
          },
        ],
        labelSearchType: [
          { value: 1, label: translate('标签名') },
          { value: 2, label: translate('标签数量 >') },
          { value: 3, label: translate('标签数量 <') },
          { value: 4, label: translate('图片ID') }, // 区别与上面的，这里的过滤是后端做过滤
          { value: 5, label: translate('图片哈希') }, // 图片搜索哈希值
        ],
        defaultProps: {
          checkStrictly: true,
          children: 'children',
          label: 'label',
          isLeaf: 'leaf',
        },
        orderType: 0,
        labelTreeNodeFilterText: '',
        labelSearchTypeValue: 1,
        labelTreeLoading: false,
        // labelStructVal: [], //标签结构
        labelAsideData: [], //标签树数据
        //标签类型
        labelTreeTypeObj: {
          customerDefect: 1,
          enginDefect: 2,
          labelName: 3,
          enginName: 4,
        },
        passType: { 1: '可放行', 2: '不确定', 3: '不可放行' },
      }
    },
    computed: {
      translate() {
        return translate
      },
      // 级联结构
      _options() {
        return this.imgStructCascader()
      },
      labelSearchTypeDesc() {
        if (this.labelSearchTypeValue === 1) {
          return translate('输入标签名检索(支持拼音)')
        }
        if ([2, 3].includes(this.labelSearchTypeValue)) {
          return translate('输入数量检索(只支持正整数)')
        }
        if (this.labelSearchTypeValue === 4) {
          return translate('输入图片名回车检索')
        }
        if (this.labelSearchTypeValue === 5) {
          return translate('请输入图片哈希回车检索')
        }
        return null
      },

      /**
       * 标签结构
       */
      labelStructVal: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
    },
    watch: {
      labelTreeNodeFilterText(value) {
        this.$refs.labelTreeNode.filter(value)
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      /**
       * 构造级联数据
       * @param {Array} startVal 初始数据
       * @param {Array} arr 递归 构造的数据结构
       */
      createdLabelTreeCascader(startVal = [], arr = []) {
        startVal.forEach((el) => {
          const _obj = { ...el }
          let _tempArr = startVal.filter((item) => item.label !== el.label)
          _tempArr = _obj.children ? _obj.children.concat(_tempArr) : _tempArr
          if (_tempArr.length) {
            _obj.children = _tempArr
            if (_obj.children.length) {
              this.createdLabelTreeCascader(_tempArr, (_obj.children = []))
            }
          }
          arr.push(_obj)
        })
        return arr
      },
      /**
       * 图片结构级联数据
       */
      imgStructCascader() {
        const _arr = this.createdLabelTreeCascader(this.options, [])
        return _arr
      },
      /**
       * 加载数据要挂在父节点下
       * @param {Array} treeData 图片目录树状数据原始数据
       * @param {String} parentId 挂在哪个父节点下面
       * @param {Array} sonData 构造好的数据
       */
      addTreeDataSonNode(treeData = [], parentId, sonData = []) {
        if (!parentId) return
        treeData.forEach((el) => {
          if (el.id === parentId) {
            el.children = sonData
          }
          if (el.children && el.children.length) {
            this.addTreeDataSonNode(el.children, parentId, sonData)
          }
        })
      },
      /**
       * 聚焦事件
       */
      focusMethod() {
        this.$emit('update:keyMethodFlag', false)
      },
      /**
       * 失去聚焦
       */
      blurMethod() {
        this.$emit('update:keyMethodFlag', true)
      },
      /**
       * 标签筛选--构造筛选树懒加载的后台请求查询条件
       * @param {Array} labelTreeNodeTypeArr 标签树层级节点的标签类型
       * @param {Object} node 节点
       * @param {Object} params 查询参数对象
       * @param {Integer} level 层级
       */
      createTreeNodeParams(labelTreeNodeTypeArr, node, params, level) {
        if (level < 0) {
          return
        }
        const index = node.data.label.lastIndexOf('(')
        const label = node.data.label.substring(0, index)
        const labelName = label.includes(' - ')
          ? label.substring(0, label.lastIndexOf(' - '))
          : label
        params[labelTreeNodeTypeArr[level]] = labelName
        this.createTreeNodeParams(
          labelTreeNodeTypeArr,
          node.parent,
          params,
          level - 1
        )
      },
      /**
       * 筛选树节点搜索方法
       * @param {String} value 筛选框输入值
       * @param {Object} data 树节点的值
       */
      labelTreeNodeFilter(value, data) {
        if (!value) return true
        if (this.labelSearchTypeValue === 1) {
          return this.$pinyinSearch.pinyinMatchStr(data.label, value)
        }
        const start = data.label.lastIndexOf('(')
        const num = data.label.substring(start + 1, data.label.length - 1)
        if (this.labelSearchTypeValue === 2) {
          return parseInt(num) > parseInt(value)
        }
        if (this.labelSearchTypeValue === 3) {
          return parseInt(num) < parseInt(value)
        }
        if (this.labelSearchTypeValue === 4) {
          return true
        }
      },
      /**
       * 标签筛选--按数组中对象的属性排序
       * @param {String} labelName
       * @param {String} labelCount
       */
      labelTreeArrayObjCompare(labelName, labelCount) {
        if (this.orderType === 1) {
          // 1. 按数量排序
          return (a, b) => {
            return this.labelAsideOrderFlag
              ? b[labelCount] - a[labelCount]
              : a[labelCount] - b[labelCount]
          }
        } else {
          // 2. 按标签名排序 labelName - labelDegree
          return (a, b) => {
            const label1 = a[labelName].split('-')
            const label2 = b[labelName].split('-')
            //情况1：对labelName排序：无标签排在首位
            if (label1[0] === translate('无标签')) {
              return -1
            }
            if (label2[0] === translate('无标签')) {
              return 1
            }
            const result = label1[0].localeCompare(label2[0], 'zh-CN')
            if (result !== 0) {
              return this.labelAsideOrderFlag ? result : result * -1
            }
            //情况2：对labelDegree排序
            if (
              (label1[1] === translate('中度') &&
                label2[1] === translate('轻度')) ||
              (label1[1] === translate('严重') &&
                label2[1] === translate('中度'))
            ) {
              return -1
            }
            if (
              (label1[1] === translate('轻度') &&
                label2[1] === translate('中度')) ||
              (label1[1] === translate('中度') &&
                label2[1] === translate('严重'))
            ) {
              return 1
            }
            //情况3：兼容数据中心标签可能有'-' 也可能没有'-'
            if (label2[1] && label1[1]) {
              return label2[1].localeCompare(label1[1], 'zh-CN')
            } else {
              return 1
            }
          }
        }
      },
      /**
       * 切换顺序与逆序显示标志位
       */
      changeLabelAsideOrder() {
        this.labelAsideOrderFlag = this.labelAsideOrderFlag !== true
        this.changeOrderType()
      },
      /**
       * 标签树排序变更事件
       */
      changeOrderType() {
        // this.labelTreeNodeFilterText = '';
        const _tempTree = this.labelAsideData.sort(
          this.labelTreeArrayObjCompare('labelName', 'labelCount')
        )
        this.labelAsideData = []
        _tempTree.forEach((el) => {
          const node = {
            id: el.id,
            label: el.label,
            leaf: el.leaf,
            source: el.source,
            labelName: el.labelName,
            labelCount: el.labelCount,
          }
          this.labelAsideData.push(node)
        })
      },
      /**
       * 点击节点就把节点勾中
       */
      setCheckedKeys(ids = []) {
        this.$refs.labelTreeNode.setCheckedKeys(ids)
      },
      /**
       * 构造标签树Lbael
       *
       */
      transformLabelByLablTree(labelInfo) {
        const _labels = []
        if (labelInfo.enginName) {
          _labels.push(labelInfo.enginName)
        }
        if (labelInfo.labelName) {
          _labels.push(labelInfo.labelName)
        }
        if (labelInfo.passType) {
          const _str = this.passType[`${labelInfo.passType}`]
          _labels.push(_str)
        }
        return _labels.join('-')
      },
      // -------------------------------------------------

      /**
       * 级联值改变
       */
      async handleChange(val) {
        this.labelStructVal = val
        // this.$refs.cascaderRef.dropDownVisible = false
        this.$nextTick(async () => {
          await this.selectCascaderFirst()
          this.$emit('saveOrUpdatePickPicExport')
        })
      },
      /**
       * 图片目录结构默认选中第一个
       */
      async selectCascaderFirst() {
        if (this.labelStructVal.length === 0) return
        const targetTypeKey = this.labelStructVal[0]
        const query = {
          imgQueryVO: {
            ...this.conditionTree,
            dataSetIds: [...this.dataSetIds],
          },
          targetType: this.labelTreeTypeObj[targetTypeKey],
        }
        const _arr = await this.listLabelTree(query)
        if (_arr.length) {
          const _data = []
          _arr.forEach((el, index) => {
            const treeobj = {
              id: `${index + 1}`,
              label: `${this.transformLabelByLablTree(el)}(${el.labelCount})`,
              leaf: this.labelStructVal.length === 1 ? true : false,
              source: el,
              labelCount: el.labelCount, //用作排序字段
              labelName: this.transformLabelByLablTree(el), //用作排序字段
            }
            _data.push(treeobj)
          })
          this.labelAsideData = _data.sort(
            this.labelTreeArrayObjCompare('labelName', 'labelCount')
          )
        } else {
          this.labelAsideData = []
        }
        this.$emit('update:labelTreeCondition', {})
      },
      /**
       * 查看标签筛选树
       * @param {Object} condition 查询条件
       * @returns
       */
      async listLabelTree(condition = {}) {
        const res = await solutionSource.listLabelTree(condition)
        if (res.code === 0) {
          return res.data
        } else {
          return []
        }
      },
      /**
       * 标签筛选--筛选树懒加载事件
       * @param {Object} node 节点
       * @param {Object} resolve
       */
      async loadLabelTreeNode(node, resolve) {
        // console.log('node', node);
        if (node.level === 0) {
          return resolve([])
        }
        // let params = [];
        const _selectKes = []
        _selectKes.push(node.data.id)
        let _labelTreeList = this.constructLabelTreeData(_selectKes)
        _labelTreeList = _labelTreeList.map((el) => {
          return {
            list: el,
          }
        })
        const _key = this.labelStructVal[node.level]
        const query = {
          imgQueryVO: {
            ...this.conditionTree,
            dataSetIds: [...this.dataSetIds],
            labelConditions: _labelTreeList,
          },
          targetType: this.labelTreeTypeObj[_key],
        }
        const _tempArr = []
        const parentId = node.data.id
        const _treeData = await this.listLabelTree(query)
        // _treeData.forEach((el, index) => {
        //   el.labelName = this.transformLabelByLablTree(el);
        // });
        _treeData.forEach((el, index) => {
          const treeObj = {
            id: `${parentId}-${index + 1}`,
            label: `${this.transformLabelByLablTree(el)}(${el.labelCount})`,
            leaf: node.level + 1 >= this.labelStructVal.length,
            source: el,
            labelCount: el.labelCount, //用作排序字段
            labelName: this.transformLabelByLablTree(el), //用作排序字段
          }
          _tempArr.push(treeObj)
        })
        this.addTreeDataSonNode(this.labelAsideData, parentId, _tempArr)
        setTimeout(() => {
          return resolve(_tempArr)
        }, 200)
      },
      /**
       * 标签筛选--筛选树节点点击事件
       * @param {String} value
       * @param {Object} node 节点
       */
      async clickLabelTreeNode(value) {
        // console.log('value:::', value);
        // console.log('node:::', node);
        this.setCheckedKeys([value.id])
        this.$nextTick(() => {
          const treeKeys = this.$refs.labelTreeNode.getCheckedKeys()
          const _labelTreeList = this.constructLabelTreeData(treeKeys)
          const query = { labelConditions: [..._labelTreeList] }
          // console.log('this.labelAsideData', this.labelAsideData);
          // console.log('this.labelAsideData', query);
          this.$emit('update:labelTreeCondition', query)
          this.$emit('labelTreeNodeCheck')
        })
      },
      /**
       * 标签树多选框点击事件
       */
      async clickLabelTreeCheckBox(data, eltreeMsg) {
        // console.log('data:::', data);
        // console.log('eltreeMsg:::', eltreeMsg);
        const _checkedKeys = eltreeMsg.checkedKeys
        const _labelTreeList = this.constructLabelTreeData(_checkedKeys)
        const query = { labelConditions: [..._labelTreeList] }
        this.$emit('update:labelTreeCondition', query)
        this.$emit('labelTreeNodeCheck')
      },
      /**
       * 标签树复选框change事件
       */
      handleCheckChange(data, checked) {
        this.curChecked = checked
      },
      /**
       * 多选标签树构造对应数据结构
       * @param {Array} treeNodes 勾选中节点相关信息
       * @param {Array} labelTreeStrucy 用户选的标签结构
       *
       */
      constructLabelTreeData(checkedKeys = []) {
        const labelQueryVO = []
        checkedKeys.length &&
          checkedKeys.forEach((el) => {
            const _splitCheckKeys = el.split('-')
            const findParentIds = [] // 查询该节点父节点
            let _parentId = ''
            _splitCheckKeys.forEach((item) => {
              _parentId = _parentId ? `${_parentId}-${item}` : item
              findParentIds.push(_parentId)
            })
            const query = []
            findParentIds.forEach((it) => {
              this.findNodeByLabelTree(this.labelAsideData, it, query)
            })
            labelQueryVO.push(query)
          })
        return labelQueryVO
      },
      /**
       * 查找父节点的数据
       * @param {Array} treeData 树状图
       * @param {String} parentId 父节点
       * @param {Object} param 构造参数
       * @returns
       */
      findNodeByLabelTree(treeData = [], parentId, param) {
        treeData.forEach((el) => {
          if (el.id === parentId) {
            param.push(el.source)
          }
          if (el.children && el.children.length) {
            this.findNodeByLabelTree(el.children, parentId, param)
          }
        })
      },
      /**
       * 按住shift多选 处理逻辑
       */
      shiftMultiSelect(data, eltreeMsg) {
        let checkedIds = []
        const sameLevelCheckedNodes = eltreeMsg.checkedNodes.filter((el) => {
          return el.parentId === data.parentId
        })
        if (this.labelTreeMultipleFlag && sameLevelCheckedNodes.length >= 2) {
          const index = sameLevelCheckedNodes.findIndex((el) => {
            return el.id === data.id
          })
          let checkedNodesId = []
          const checkedNodesIdList = []
          if (index === 0) {
            checkedNodesId = sameLevelCheckedNodes.slice(0, 2).map((el) => {
              return el.id
            })
          } else {
            checkedNodesId = sameLevelCheckedNodes
              .slice(index - 1, index + 1)
              .map((el) => {
                return el.id
              })
          }
          for (let i = checkedNodesId[0]; i <= checkedNodesId[1]; i++) {
            checkedNodesIdList.push(i)
          }
          checkedIds = [
            ...new Set(checkedNodesIdList.concat(eltreeMsg.checkedKeys)),
          ]
          this.$refs.labelTreeNode.setCheckedKeys([...checkedIds])
        }
      },
      /**
       * 根据文件名查询图片
       */
      async searchImgByName() {
        if ([4, 5].includes(this.labelSearchTypeValue)) {
          // 清空勾选中的标签树
          this.resetLabelTree()
          const query = {}
          if (this.labelSearchTypeValue === 4) {
            const _imgIds = [this.labelTreeNodeFilterText]
            query.imgIds = _imgIds
          }
          if (this.labelSearchTypeValue === 5) {
            const _hash = [this.labelTreeNodeFilterText]
            query.hash = _hash
          }
          // console.log('query', query);
          this.$emit('update:labelTreeCondition', query)
          this.$emit('labelTreeNodeCheck')
        }
      },
      /**
       * 重置标签树
       */
      async resetLabelTreeCheck() {
        this.resetLabelTree()
        await this.selectCascaderFirst()
        this.$nextTick(() => {
          this.$emit('labelTreeNodeCheck')
        })
      },
      /**
       * 标签树刷新
       */
      async labelTreeRefresh() {
        this.resetLabelTree()
        await this.selectCascaderFirst()
      },
      /**
       * 清空标签树操作
       */
      resetLabelTree() {
        this.$refs.labelTreeNode.setCheckedKeys([])
        // this.labelAsideData = [];
      },
    },
  }
</script>
<style scoped lang="scss">
  :deep() {
    .el-form .el-form-item {
      margin-bottom: 5px;
    }
  }
  .labeltree-content {
    width: 100%;
    height: 100%;
    .search-left {
      padding-left: 5px;
      .el-button {
        font-size: 15px;
        color: #8492a6;
        padding: 5px 0;
        margin-right: 10px;
      }
    }
    .search-right {
      text-align: right;
    }
    .labeltree-body {
      width: 100%;
      height: calc(100% - 115px);
      border: 1px solid #f5f5f5;
      border-radius: 5px;
      padding: 2px;
      .el-tree {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    }
  }
</style>
