<template>
  <div class="pic-structure">
    <div style="display: flex">
      <div style="flex: 1">
        <el-form class="label-tree-form" label-width="75px">
          <el-form-item :label="translate('图片结构')">
            <el-cascader
              ref="cascaderRef"
              v-model="imgStructVal"
              :options="_options"
              :props="defaultProps"
              style="width: 100%"
              @change="handleChange"
            />
          </el-form-item>
        </el-form>
      </div>
      <div style="padding: 0 2px">
        <el-button
          class="el-icon-refresh"
          type="primary"
          @click="selectCascaderFirst"
        >
          {{ translate('刷新') }}
        </el-button>
      </div>
    </div>
    <div class="tree-content">
      <el-tree
        ref="treeDataRef"
        :data="treeData"
        highlight-current
        lazy
        :load="treeLoadNode"
        node-key="id"
        :props="treedefaultProps"
        @node-click="nodeClick"
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
      // 数据集编码ID
      dataSetIds: {
        type: Array,
        default: () => [],
      },
      conditionTree: {
        type: Object,
        default: () => {},
      },
    },
    emits: [
      'update:modelValue',
      'saveOrUpdatePickPicExport',
      'update:conditionTree',
      'conditionTreeClick',
    ],
    data() {
      return {
        // imgStructVal: [],
        value: [],
        treedefaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'leaf',
        },
        defaultProps: {
          checkStrictly: true,
          expandTrigger: 'click',
          label: 'label',
          value: 'value',
          children: 'children',
        },
        targetType: {
          factoryName: 1,
          lineName: 2,
          machineName: 3,
          stationName: 4,
          cameraName: 5,
          capturePos: 6,
          opticalMode: 7,
          productSN: 8,
        },
        options: [
          { label: 'SN', value: 'productSN' },
          { label: '工厂', value: 'factoryName' },
          { label: '线体', value: 'lineName' },
          { label: '设备', value: 'machineName' },
          {
            label: '工位',
            value: 'stationName',
            children: [
              {
                label: '相机',
                value: 'cameraName',
                children: [
                  {
                    label: '采图点位',
                    value: 'capturePos',
                    children: [
                      {
                        label: '光照ID',
                        value: 'opticalMode',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        treeData: [],
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
      /**
       * 条件筛选树
       */
      imgStructVal: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
    },
    created() {},
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
        console.log('_arr:::', _arr)
        return _arr
      },
      /**
       * 级联值改变
       */
      async handleChange(val) {
        this.imgStructVal = val
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
        if (this.imgStructVal.length === 0) return
        const targetTypeKey = this.imgStructVal[0]
        const query = {
          imgQueryVO: {
            dataSetIds: [...this.dataSetIds],
          },
          targetType: this.targetType[targetTypeKey],
        }
        const _arr = await this.listConditionTree(query)
        const _data = []
        _arr.forEach((el, index) => {
          const treeobj = {
            id: `${index + 1}`,
            label: `${el.conditionName}(${el.conditionCount})`,
            leaf: this.imgStructVal.length === 1 ? true : false,
          }
          _data.push(treeobj)
        })
        this.treeData = _data
        this.$emit('update:conditionTree', {})
      },
      /**
       * 查看条件筛选树
       * @param {Object} condition 传入条件
       * @return
       */
      async listConditionTree(condition = {}) {
        const res = await solutionSource.listConditionTree(condition)
        if (res.code === 0) {
          return res.data
        } else {
          return []
        }
      },
      /**
       * 初始化会调用一次
       * 树节点懒加载
       */
      async treeLoadNode(node, resolve) {
        if (node.level === 0) {
          return resolve([])
        } else {
          console.log('node', node)
          const _query = {}
          this.createTreeNodeParams(
            this.imgStructVal,
            node,
            _query,
            node.level - 1
          )
          const targetTypeKey = this.imgStructVal[node.level]
          const query = {
            imgQueryVO: {
              ..._query,
              dataSetIds: [...this.dataSetIds],
            },
            targetType: this.targetType[targetTypeKey],
          }
          const _treeData = await this.listConditionTree(query)
          const _tempArr = []
          const parentId = node.data.id
          _treeData.length &&
            _treeData.forEach((el, index) => {
              const treeObj = {
                id: `${parentId}-${index + 1}`,
                label: `${el.conditionName}(${el.conditionCount})`,
                leaf: node.level + 1 >= this.imgStructVal.length,
              }
              _tempArr.push(treeObj)
            })
          this.addTreeDataSonNode(this.treeData, parentId, _tempArr)
          setTimeout(() => {
            return resolve(_tempArr)
          }, 200)
        }
      },

      /**
       * 加载数据要挂在父节点下
       * @param {Array} treeData 图片目录树状数据原始数据
       * @param {String} parentId 挂在哪个父节点下面
       * @param {Array} sonData 构造好的数据
       */
      addTreeDataSonNode(treeData = [], parentId, sonData = []) {
        if (parentId) {
          treeData.forEach((el) => {
            if (el.id === parentId) {
              el.children = sonData
            }
            if (el.children && el.children.length) {
              this.addTreeDataSonNode(el.children, parentId, sonData)
            }
          })
        }
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
       * 树节点点击事件
       */
      nodeClick(nodeObj, node, nodeSelf) {
        // console.log('nodeObj自身', nodeObj);
        // console.log('node', node);
        console.log('nodeSelf组件', nodeSelf)
        // this.$refs.treeDataRef.setCheckedKeys([]);
        // this.$refs.treeDataRef.setCheckedKeys([nodeObj.id]);
        const query = {}
        this.createTreeNodeParams(
          this.imgStructVal,
          node,
          query,
          node.level - 1
        )
        // console.log('jjjjjj', query);
        this.$emit('update:conditionTree', query)
        this.$emit('conditionTreeClick')
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  :deep() {
    .label-tree-form .el-form-item {
      margin-bottom: 5px;
    }
  }
  .pic-structure {
    width: 100%;
    height: 100%;
    .tree-content {
      width: 100%;
      height: calc(100% - 37px);
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
