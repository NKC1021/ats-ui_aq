<template>
  <div class="standard-data-tool-container">
    <div class="standard-header">
      <el-select v-model="selectType" @change="changeType1">
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div>
        <el-button
          icon="el-icon-setting"
          type="primary"
          @click="enableTypeVis = true"
        >
          {{ translate('启用') }}
        </el-button>
        <el-button icon="Upload" type="primary" @click="importExcel">
          {{ translate('导入') }}
        </el-button>
        <el-button icon="el-icon-download" type="primary" @click="exportExcel">
          {{ translate('导出') }}
        </el-button>
        <el-button icon="el-icon-plus" type="danger" @click="addNewRow">
          {{ translate('新增行') }}
        </el-button>
        <el-button icon="el-icon-s-grid" type="primary" @click="openDrawer">
          {{ translate('列显隐设置') }}
        </el-button>
      </div>
    </div>

    <div id="standardTable">
      <vxe-table
        ref="standardTableRef"
        v-loading="loading"
        border
        :cell-class-name="cellClassName"
        :column-config="{ resizable: true }"
        :data="tableData"
        :edit-config="{ trigger: 'dblclick', mode: 'cell' }"
        :header-cell-class-name="headerCellClassName"
        height="100%"
        :menu-config="menuConfig"
        :merge-cells="mergeCells"
        :mouse-config="{ selected: true }"
        :scroll-x="{ enabled: true, gt: 10 }"
        :scroll-y="{ enabled: true, gt: 20 }"
        @cell-click="cellClick"
        @edit-actived="editActived"
        @edit-closed="editClosed"
        @menu-click="contextMenuClickEvent"
        @resizable-change="resizableChange"
      >
        <vxe-column :title="translate('序号')" type="seq" width="60" />
        <vxe-colgroup
          v-for="(group, index) in tableColumnGroup"
          :key="index"
          :title="group.title"
        >
          <vxe-column
            v-for="(colConfig, colIndex) in tableColumn[group.col]"
            :key="colIndex"
            :edit-render="
              colConfig.edit ? { autofocus: '.vxe-input--inner' } : undefined
            "
            :field="colConfig.field"
            :filters="colConfig.filters"
            :fixed="colConfig.fixed"
            :type="`${colConfig.type}`"
            :width="colConfig.width"
          >
            <!-- 1. 表头slot -->
            <template #header>
              <div class="table-title">
                <div class="title" :data-title="colConfig.remark">
                  {{ colConfig.title }}
                </div>
              </div>
            </template>
            <!-- 2. 常规列slot -->
            <template #edit="{ row, rowIndex }">
              <vxe-input
                v-model="row[colConfig.field]"
                placeholder=""
                type="text"
                @keydown="enterEvent($event, row, colConfig, rowIndex)"
              />
            </template>
            <!-- 3. 特殊列slot -->
            <template
              #default="{ row, column, rowIndex }"
              v-if="
                colConfig.field === 'cameraCode' ||
                colConfig.field === 'point' ||
                colConfig.isImg
              "
            >
              <!-- 3.1 相机标号列 -->
              <div
                v-if="colConfig.field === 'cameraCode'"
                class="sop-cell-content"
              >
                <template v-if="row[column.field][0].key">
                  <el-tag
                    v-for="(item, cameraIndex) in row[column.field]"
                    :key="cameraIndex"
                    class="custom-tag"
                    closable
                    @close="deleteGroupCriteria(item, null, true)"
                  >
                    {{ item.key }}
                    <div
                      v-if="cameraIndex !== row[column.field].length - 1"
                      hidden
                    >
                      ,
                    </div>
                  </el-tag>
                </template>
                <template v-if="row[column.field + 'Edit' + rowIndex]">
                  <input
                    :id="column.field + rowIndex"
                    ref="inputRef"
                    class="input-css"
                    type="text"
                    :value="inputValue"
                    @input="handleOnInput"
                    @keydown="
                      handleKeyDown($event, row, column.field, rowIndex, true)
                    "
                  />
                </template>
                <el-button
                  icon="el-icon-plus"
                  link
                  style="padding: 0px 0px"
                  type="primary"
                  @click="handleShowInput(row, column, rowIndex)"
                />
              </div>

              <!-- 3.2 采图点位列slot -->
              <div v-if="colConfig.field === 'point'" class="sop-cell-content">
                <template v-if="row[column.field][0].key">
                  <el-tag
                    v-for="(item, pointIndex) in row.pointMap.arr"
                    :key="pointIndex"
                    class="custom-tag"
                    closable
                    @close="deleteGroupCriteria(item, row.pointMap.map)"
                  >
                    {{ item }}
                    <div
                      v-if="pointIndex !== row.pointMap.arr.length - 1"
                      hidden
                    >
                      ,
                    </div>
                  </el-tag>
                </template>
                <template v-if="row[column.field + 'Edit' + rowIndex]">
                  <input
                    :id="column.field + rowIndex"
                    ref="inputRef"
                    class="input-css"
                    type="text"
                    :value="inputValue"
                    @input="handleOnInput"
                    @keydown="
                      handleKeyDown($event, row, column.field, rowIndex, false)
                    "
                  />
                </template>
                <el-button
                  icon="el-icon-plus"
                  link
                  style="padding: 0px 0px"
                  type="primary"
                  @click="handleShowInput(row, column, rowIndex)"
                />
              </div>

              <!-- 3.3 图像列slot -->
              <div v-if="colConfig.isImg">
                <div v-if="row[column.field]" class="sop-img-content">
                  <el-image
                    v-for="(item, imgIndex) in row[column.field].slice(0, 3)"
                    :key="imgIndex"
                    :alt="''"
                    class="img-view"
                    :src="'data:image/png;base64,' + imgHashBase64[item.imgKey]"
                    :v-loading="isImgLoading"
                  />
                </div>
                <el-button
                  v-if="row[column.field]"
                  link
                  style="padding: 0px 0px"
                  type="primary"
                  @click="clickImgDetail(row[column.field])"
                >
                  {{ translate('查看') }}
                </el-button>
              </div>
            </template>
          </vxe-column>
        </vxe-colgroup>
      </vxe-table>
    </div>

    <!-- 列显隐 -->
    <el-drawer
      v-model="isShowDrawer"
      direction="rtl"
      size="15%"
      :title="translate('列显隐设置')"
    >
      <div>
        <div>
          <el-checkbox
            v-model="showAllCol"
            class="m-l-20"
            :indeterminate="showColList.length !== allColNameList.length"
            style="margin: 10px"
            @change="handleShowAllCol"
          >
            {{ translate('全选') }}
          </el-checkbox>
          <el-checkbox
            v-model="showSome"
            class="m-l-20"
            style="margin: 10px"
            @change="handleShowSomeCol"
          >
            {{ translate('勾选关键列') }}
          </el-checkbox>
        </div>

        <el-checkbox-group
          v-model="showColList"
          style="display: flex; flex-direction: column"
          @change="handleChangeSelect"
        >
          <el-checkbox
            v-for="item in allColAndLabel"
            :key="item.value"
            :label="item.value"
            style="padding-bottom: 8px; padding-left: 15px"
            :title="item.label + '：' + item.remark"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <div style="padding: 15px">
          <el-button @click="handleShowOption(0)">
            {{ translate('取消') }}
          </el-button>
          <el-button type="primary" @click="handleShowOption(1)">
            {{ translate('保存') }}
          </el-button>

          <el-tooltip
            class="item"
            :content="translate('所有标准的显隐列和列宽都恢复默认值')"
            effect="dark"
            placement="top"
          >
            <el-button type="danger" @click="restoreDefault()">
              {{ translate('默认设置') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-drawer>
    <!-- 标签设置 -->
    <el-dialog
      v-model="enableTypeVis"
      :close-on-click-modal="false"
      :title="translate('标签配置')"
      top="20vh"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item :label="translate('启用标签')" prop="labelSetting">
          <el-radio-group v-model="enableType">
            <el-radio :label="1">
              {{ translate('客户标签') }}
            </el-radio>
            <el-radio :label="2">{{ translate('工程标签') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateSolutionCancel">
          {{ translate('取消') }}
        </el-button>
        <el-button type="primary" @click="updateSolution">
          {{ translate('保存') }}
        </el-button>
      </template>
    </el-dialog>
    <!-- 查看详情 -->
    <detail
      v-if="showDetail"
      v-model:current-row="currentRow"
      v-model:show-more="showDetail"
      @remove-sop-success="removeSopSuccess"
    />
    <importStandard v-model:show="importStandardVis" @import-success="init" />
  </div>
</template>

<script>
  import {
    bodyContextmenus,
    defectCol,
    filedImgMap,
    indexCol,
    modelCol,
    opticsCol,
    selectOptions,
  } from './config'
  import { getStore, setStore } from '@/utils/storage'
  import { translate } from '@/i18n'
  import { arraysAreEqual, deepClone } from '@/utils/util'
  import standardApi from '@/api/solutionCriteria.js'
  import configApi from '@/api/solutionConfig.js'
  import solutionApi from '@/api/solution.js'
  import solutionSourceApi from '@/api/solutionSource.js'
  import XLSX from 'xlsx'
  import FileSaver from 'file-saver'
  import detail from '@/views/components/project/standard/criteriaDetail/index.vue'
  import importStandard from '@/views/components/project/standard/importStandard/index.vue'
  import dayjs from 'dayjs'
  import { ElMessageBox } from 'element-plus'

  export default {
    components: { detail, importStandard },
    data() {
      return {
        loading: true,
        translate: translate,
        tableColumnGroup: [],
        tableColumn: {}, // 表格列
        tableData: [], // 表格数据
        selectionObj: {
          rowIndex: null,
          fieldName: null,
          type: null,
        },
        spanObj: [],
        showSome: false,
        solutionSopConfig: {},
        userConfig: {},
        currentRow: [], //记录点击行数据相关信息 用来查看图片详情
        showDetail: false,
        imgHashBase64: {}, // 页面所有hash和base64图片串的映射关系
        imgKeySet: new Set(), // 页面所有图片的key集合，key为hash+suffix
        enableTypeVis: false, //解决方案启用标签类型
        solutionInfo: {}, //当前解决方案信息
        solutionEnableType: 1, //解决方案启用类型
        leafNodeFieldList: [], // 叶子节点的字段名列表（和展示顺序一致）
        showColList: [], // 显示的列
        hideList: [], // 隐藏的列
        allColNameList: [], // 所有列（和展示顺序一致）
        allColAndLabel: [], // 所有列（英文filed和中文名）
        primaryColNameList: [], // 所有主键列（和展示顺序一致）
        colParentFieldMap: {}, //数据列的父子映射关系 {子列：父列}，为了保证合并列是从左到右有层级的
        colIndexMapCache: {}, //数据列与其列号缓存
        colIndexMap: {}, //数据列与其列号
        primaryColStyleMap: {}, //数据列的样式信息
        colParentIdMap: {}, //数据列名和其父级主键id的映射 {列名，父级主键id}
        masterParamsMap: {}, //主键列的params属性的集合（除了图像列） {主键id,[param列名1,param列名2,...]}
        colConfigMap: {}, //列名与其配置项的映射 {列名,其配置项}
        dbColConfig: {}, //数据库的列配置
        importStandardVis: false, //导入检测标准
        selectRowIndex: null, //选中行号
        selectColumnField: null, //选中列名
        isImgLoading: true,
        isShowDrawer: false,
        selectType: [],
        selectOptions: selectOptions,
        inputValue: '',
        menuConfig: {
          className: 'standard-menus',
          body: {
            options: bodyContextmenus,
          },
        },
        mergeCells: [],
      }
    },

    computed: {
      showAllCol: {
        get() {
          if (this.showColList.length === this.allColNameList.length) {
            return true
          }
          return false
        },
        set() {},
      },
      /**
       * 解决方案启用标签类型
       */
      enableType: {
        get() {
          return this.solutionEnableType
        },
        set(newVal) {
          this.solutionEnableType = newVal
        },
      },
    },

    mounted() {
      this.init()
    },

    created() {
      this.getById()
    },
    methods: {
      /**
       * @description: 处理单元格选中事件
       * @param {*} rowIndex
       * @param {*} fieldName
       * @return {*}
       */
      handleSelection() {
        const { rowIndex, fieldName, type } = this.selectionObj
      },

      /**
       * 导入检测标准
       */
      importExcel() {
        ElMessageBox.confirm(
          translate(
            '此操作会导致当前项目所有标准管理数据清除，如果不确定会导致的后果，建议保存版本后操作'
          ),
          {
            confirmButtonText: translate('确定'),
            cancelButtonText: translate('取消'),
            type: 'warning',
          }
        )
          .then(() => {
            this.importStandardVis = true
          })
          .catch(() => {
            //  this.importStandardVis = true
          })
      },

      /**
       * 获取解决方案信息
       */
      async getById() {
        const res = await solutionApi.getById()
        if (res && res.code === 0) {
          this.solutionInfo = res.data
          this.solutionEnableType = res.data.enableType
        }
      },
      /**
       * 更新解决方案启用标签类型
       */
      async updateSolution() {
        const query = { ...this.solutionInfo }
        query.enableType = this.solutionEnableType
        const res = await solutionApi.updateSolution(query)
        if (res.code === 0) {
          this.$message.success(res.msg)
          this.solutionInfo = res.data
          this.enableTypeVis = false
        }
      },
      updateSolutionCancel() {
        this.solutionEnableType = this.solutionInfo.enableType
        this.enableTypeVis = false
      },
      /**
       * @description: 显示全部
       * @param {*} checked
       */
      handleShowAllCol(checked) {
        this.showSome = false
        if (checked) {
          this.allColNameList.forEach((item) => {
            this.showColList.push(item)
          })
        } else {
          this.showColList = []
        }
      },
      /**
       * 勾选关键列
       */
      handleShowSomeCol(checked) {
        if (checked) {
          console.log('this.primaryColNameList;', this.primaryColNameList)
          this.showColList = []
          this.showColList = deepClone(this.primaryColNameList)
          this.showColList.push('ROIs')
        } else {
          this.showColList = []
        }
      },
      // 隐藏or显示列的勾选change事件
      handleChangeSelect(val) {
        this.showColList = val
      },

      // 隐藏or显示列的控制逻辑
      handleShowOption(index, deleteWidth) {
        this.isShowDrawer = false
        this.showSome = false
        if (index == 0) {
          this.isShowDrawer = false
          return
        }
        this.saveOrUpdateUserProjectConfig()
        this.showColumns(this.showColList)
        this.hideList = this.allColNameList.filter(
          (item) => !this.showColList.includes(item)
        )
        this.hideColumns(this.hideList)

        this.initSpanObj(this.tableData)
        this.showColumns(this.showColList)
        this.hideColumns(this.hideList)
      },

      // 隐藏列
      hideColumns(keys) {
        const tableRef = this.$refs['standardTableRef']
        if (tableRef) {
          keys.forEach((ele) => {
            tableRef.hideColumn(ele)
          })
        }
      },
      // 显示列
      showColumns(keys) {
        const tableRef = this.$refs['standardTableRef']
        if (tableRef) {
          keys.forEach((ele) => {
            tableRef.showColumn(ele)
          })
        }
      },

      // 将树形结构转化为list结构
      convertTreeToList(treeData, parent = {}) {
        const list = []
        if (!Array.isArray(treeData)) {
          return list
        }
        treeData.forEach((ele) => {
          const criteria = ele.criteria
          const item = { ...parent }
          if (criteria.fieldName) {
            item[criteria.fieldName] = criteria.key
          }
          // 主键id的值
          if (criteria.id) {
            item[this.colConfigMap[criteria.fieldName].id] = criteria.id
            // 拥有groupCriteria属性的列，还需要构造
            if (this.colConfigMap[criteria.fieldName].groupCriteria) {
              item[criteria.fieldName] = []
              item[criteria.fieldName].push({
                id: criteria.id,
                key: criteria.key,
              })
            }
          }
          // params
          if (criteria.params) {
            const obj = JSON.parse(criteria.params)
            for (const key in obj) {
              item[key] = obj[key]
            }
          }
          // 数据里有groupCriteria，补充完整groupCriteria
          const groupCriteria = ele.groupCriteria
          if (Array.isArray(groupCriteria) && groupCriteria.length > 0) {
            groupCriteria.forEach((groupItem) => {
              item[criteria.fieldName].push({
                id: groupItem.id,
                key: groupItem.key,
              })
            })
          }
          // 点位特殊处理
          if (criteria.fieldName === 'point') {
            let newArr = []
            const obj = {} // value和id的映射关系
            if (item[criteria.fieldName][0].key) {
              const arr = []
              item[criteria.fieldName].forEach((item) => {
                arr.push(item.key)
                obj[item.key] = item.id
              })
              newArr = this.convertToRanges(arr)
            }
            item[`${criteria.fieldName}Map`] = {
              arr: newArr,
              map: obj,
            }
          }
          // 图像列处理
          if (this.colConfigMap[criteria.fieldName].isImg) {
            if (
              item[criteria.fieldName] &&
              item[criteria.fieldName].length > 0
            ) {
              item[criteria.fieldName].sort((a, b) => b.id - a.id)
            }
          }
          // relateCriteriaParams（目前只用来构造roi的值）
          const relateCriteriaParams = ele.relateCriteriaParams
          if (relateCriteriaParams) {
            for (const key in relateCriteriaParams) {
              const relateCriteriaJson = relateCriteriaParams[key]
              if (relateCriteriaJson) {
                const obj = JSON.parse(relateCriteriaJson)
                for (const o in obj) {
                  item[o] = obj[o]
                }
              }
            }
          }

          // relateSources 图片相关信息
          const relateSources = ele.relateSources
          if (relateSources && relateSources.length > 0) {
            for (const obj of relateSources) {
              const passType = obj.passType
              let imgFiledName
              if (passType) {
                imgFiledName = filedImgMap[criteria.fieldName][passType]
              } else {
                imgFiledName = filedImgMap[criteria.fieldName]
              }
              if (!item[imgFiledName]) {
                item[imgFiledName] = []
              }
              item[imgFiledName].push(obj)
              obj.imgKey && this.imgKeySet.add(obj.imgKey)
            }
          }
          // 递归 or 返回
          if (ele.childrenCriteria && ele.childrenCriteria.length > 0) {
            const childrenList = this.convertTreeToList(
              ele.childrenCriteria,
              item
            )
            list.push(...childrenList)
          } else {
            list.push(item)
          }
        })
        return list
      },

      async changeType1(val) {
        setStore({
          name: 'standardType',
          content: val,
          type: 'session',
        })
        // vxe-table插件有bug，改变列配置有报错，必须刷新页面才可以正常显示
        location.reload()
        // this.$router.push({ path: this.$route.path })
      },

      /**
       * @description: 维度类型切换触发函数
       */
      async changeType() {
        this.tableColumnGroup = []
        this.tableColumn = {}
        // this.tableColumn.push(indexCol)
        if (arraysAreEqual(selectOptions[0].value, this.selectType)) {
          // 光学方案维度
          this.initColInfo(opticsCol, defectCol, modelCol)
        }
        if (arraysAreEqual(selectOptions[1].value, this.selectType)) {
          // 缺陷维度
          this.initColInfo(defectCol, opticsCol, modelCol)
        }
        if (arraysAreEqual(selectOptions[2].value, this.selectType)) {
          // AI工程维度
          // 调整顺序，将ROIs放在光学方案的最后一列
          let i = 0
          const modelObj = deepClone(modelCol)
          const opticsObj = deepClone(opticsCol)
          let roiObj = {}
          modelObj.children.forEach((item, index) => {
            if (item.field === 'ROIs') {
              i = index
              roiObj = item
            }
          })
          modelObj.children.splice(i, 1)
          opticsObj.children.push(roiObj)

          this.initColInfo(modelObj, defectCol, opticsObj)
        }
        this.handleChangeShowCol()
        await this.getTableData()
        this.getThumbnailImg()
      },

      /**
       * @description: 控制显示列
       * @return {*}
       */
      handleChangeShowCol() {
        if (this.userConfig && this.userConfig.solutionSopConfig) {
          const solutionSopConfigObj = JSON.parse(
            this.userConfig.solutionSopConfig
          )
          // 用户设置里有数据，否则默认勾选全部
          if (
            solutionSopConfigObj[this.selectType] &&
            solutionSopConfigObj[this.selectType].show
          ) {
            this.showColList = solutionSopConfigObj[this.selectType].show
          } else {
            this.showColList = deepClone(this.allColNameList)
          }
          // this.showColumns(this.showColList)
          this.hideList = this.allColNameList.filter(
            (item) => !this.showColList.includes(item)
          )
          // this.hideColumns(this.hideList)
          console.log('看一下显隐列======', this.showColList, this.hideList)
        } else {
          this.showColList = this.allColNameList
          // this.showColumns(this.showColList)
        }
      },

      /**
       * @description: 初始化处理配置信息 & 放入到columns配置中
       * @param {*} obj
       * @param {*} allCol
       */
      initColConfig(obj, allCol) {
        obj['children'].forEach((item) => {
          this.allColNameList.push(item.field)
          this.allColAndLabel.push({
            label: item.title,
            value: item.field,
            remark: item.remark,
          })

          allCol.push(item)
          if (
            this.dbColConfig[this.selectType] &&
            this.dbColConfig[this.selectType][item.field]
          ) {
            item.width = this.dbColConfig[this.selectType][item.field].width
          }
        })
        this.tableColumnGroup.push({
          col: obj.key,
          title: obj.title,
        })
        this.tableColumn[obj.key] = obj.children
      },

      /**
       * @description: 初始化列的相关信息
       * @return {*}
       */
      initColInfo(obj1, obj2, obj3) {
        const o1 = deepClone(obj1)
        const o2 = deepClone(obj2)
        const o3 = deepClone(obj3)
        this.leafNodeFieldList = []
        this.showColList = []
        this.allColNameList = []
        this.allColAndLabel = []
        this.primaryColNameList = []
        this.colParentFieldMap = {}
        this.primaryColStyleMap = {}
        this.colParentIdMap = {}
        this.masterParamsMap = {}
        this.colConfigMap = {}
        //1.初始化处理配置信息 & 放入到columns配置中
        const allCol = []
        allCol.push(indexCol)
        this.initColConfig(o1, allCol)
        this.initColConfig(o2, allCol)
        this.initColConfig(o3, allCol)
        console.log('this.tableColumnGroup========', this.tableColumnGroup)
        console.log('this.tableColumn========', this.tableColumn)
        //2.数据列的父子映射关系
        this.allColNameList.forEach((item, index) => {
          this.colParentFieldMap[item] =
            index === 0 ? null : this.allColNameList[index - 1]
          this.colIndexMapCache[item] = index + 1
        })
        //3.列的其他映射关系处理
        let styleFlag = true
        allCol.forEach((column) => {
          //列名与其配置的映射
          this.colConfigMap[column.field] = column
          //主键列的params属性的集合

          if (column.params) {
            if (
              !Object.prototype.hasOwnProperty.call(
                this.masterParamsMap,
                column.id
              )
            ) {
              console.log(
                '看一下this.masterParamsMap====前',
                column.id,
                this.masterParamsMap,
                column.field
              )
              this.masterParamsMap[column.id] = []
            }
            this.masterParamsMap[column.id].push(column.field)
          }
          // 主键列
          if (column.isPrimaryCol) {
            this.primaryColNameList.push(column.field)
          }
          // 叶子节点列
          if (column.isLeafNode) {
            this.leafNodeFieldList.push(column.field)
          }
          // 列样式
          if (column.type === 'seq') {
            styleFlag = true
          }
          if (column.isPrimaryCol) {
            styleFlag = !styleFlag
          }
          if (styleFlag && column.type !== 'seq') {
            this.primaryColStyleMap[column.field] = 'table-body-cell-primary'
          } else {
            this.primaryColStyleMap[column.field] = ''
          }
        })
        console.log('this.primaryColStyleMap::::', this.primaryColStyleMap)
        console.log('this.colConfigMap::::', this.colConfigMap)
        // 列名和其父级主键id的映射
        this.primaryColNameList.forEach((item, index) => {
          if (index === 0) {
            this.colParentIdMap[item] = ''
          } else {
            const parentColName = this.primaryColNameList[index - 1]
            this.colParentIdMap[item] = this.colConfigMap[parentColName].id
          }
        })
      },

      /**
       * @description: 将连续数组转化为 1-4形式
       * @param {*} nums
       * @return {*}
       */
      convertToRanges(nums) {
        const sortedNums = nums.sort((a, b) => a - b)
        const ranges = []
        let start = sortedNums[0]
        let end = sortedNums[0]

        for (let i = 1; i < sortedNums.length; i++) {
          if (sortedNums[i] - sortedNums[i - 1] === 1) {
            end = sortedNums[i]
          } else {
            ranges.push(this.getRange(start, end))
            start = sortedNums[i]
            end = sortedNums[i]
          }
        }
        ranges.push(this.getRange(start, end))
        return ranges
      },

      /**
       * @description: 是否转化为 1-4 形式
       * @param {*} start
       * @param {*} end
       * @return {*}
       */
      getRange(start, end) {
        return start === end ? start.toString() : `${start}-${end}`
      },

      /**
       * @description: 表格数据合并逻辑控制
       * @param {*} row
       * @param {*} column
       * @param {*} rowIndex
       * @return {*}
       */
      bodyCellSpan({ row, column, rowIndex }) {
        //判断合并列
        if (column.unSpan) {
          return
        }
        const _row = this.spanObj[column.key][rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col,
        }
      },

      /**
       * @description: 渲染前先处理选择框相关逻辑
       * @return {*}
       */
      initSelection() {
        let { rowIndex } = this.selectionObj
        const { fieldName, type } = this.selectionObj
        if (!fieldName) {
          return
        }
        console.log(
          '进入选择框的选中=====前',
          rowIndex,
          fieldName,
          this.selectionObj
        )
        const spanValue = this.spanObj[fieldName][rowIndex]
        if (type && type === 'ADD_ROW_ABOVE') {
          // 向上插入
        }
        if (type && type === 'ADD_ROW_BELOW') {
          // 向下插入
          rowIndex = rowIndex + spanValue
        }
        if (type && type === 'MOVE_ABOVE') {
          // 上移
          const preIndex = rowIndex - 1
          const spanNum = this.getParentColSpanRowStartNum(
            0,
            this.spanObj,
            fieldName,
            preIndex
          )
          rowIndex = rowIndex - spanNum
        }
        if (type && type === 'MOVE_BELOW') {
          // 下移
          const postIndex = rowIndex + spanValue
          const spanNum = this.spanObj[fieldName][postIndex]
          rowIndex = rowIndex + spanNum
        }
        if (type && type === 'DELETE_ROW') {
          // 删除
        }
        this.selectionObj = {
          rowIndex: rowIndex,
          fieldName: fieldName,
          type: type,
        }
        console.log(
          '进入选择框的选中=====后',
          rowIndex,
          fieldName,
          this.selectionObj
        )
      },

      /**
       * @description: 构造合并控制对象
       * @param {*} data 表格数据
       * @param {*} allowSpanCol 允许合并的列（传空则为允许所有列合并）
       * @return {*}
       */
      initSpanObj(data, allowSpanCol = []) {
        // 1.构造显示列，及其列序号
        this.colIndexMap = {}
        if (this.showColList.length !== 0) {
          const filteredColNameList = this.allColNameList.filter((colName) => {
            return this.showColList.includes(colName)
          })
          filteredColNameList.forEach((item, index) => {
            this.colIndexMap[item] = index + 1
          })
        } else {
          this.colIndexMap = this.colIndexMapCache
        }
        console.log('this.colIndexMap========', this.colIndexMap)
        // 2.设置选中对象
        this.initSelection()
        // 3.构造合并对象
        const [spanObj, pos] = [{}, {}]
        for (let i = 0; i < data.length; i++) {
          const dataI = data[i]
          // 循环处理所有列
          this.allColNameList.forEach((key) => {
            if (data.length === 1) {
              //如果只有一条数据时默认为1即可，无需合并
              spanObj[key] = [1]
              pos[key] = 0
            } else {
              if (i === 0) {
                spanObj[key] = []
              }
              const [currentRow, preRow] = [dataI, data[i - 1]]
              const primaryId = this.colConfigMap[key].id
              //判断上一行是否存在 & 当前行和上一行的id是否相同 & 允许合并的列 & 合并列的函数是否超过父级列
              if (
                preRow &&
                currentRow[primaryId] === preRow[primaryId] &&
                (!allowSpanCol.length || allowSpanCol.includes(j)) &&
                this.checkFrontColumn(spanObj, key, pos[key])
              ) {
                // 符合条件则合并函数+1
                spanObj[key][pos[key]] += 1
                spanObj[key].push(0)
              } else {
                spanObj[key].push(1)
                pos[key] = i
              }
            }
          })
        }
        console.log('spanObj======', spanObj)
        this.spanObj = spanObj
        this.createMergeCells()
      },

      /**
       * @description: 创建合并对象
       * @return {*}
       */
      createMergeCells() {
        const arr = []
        for (const key in this.spanObj) {
          const col = this.colIndexMap[key]
          const fieldSpanArr = this.spanObj[key]
          fieldSpanArr.forEach((item, index) => {
            if (item !== 0 && item !== 1) {
              arr.push({
                row: index,
                col: col,
                rowspan: item,
                colspan: 1,
              })
            }
          })
        }
        console.log('合并对象=====', arr)
        this.mergeCells = arr
      },

      /**
       * @description: 校验‘当前列’的合并行数是否超过‘父级列’的合并行数
       * @param {*} spanObj 合并操作控制对象
       * @param {*} currentCol 当前列名
       * @param {*} currentColStartIndex 合并对象的起始行
       * @return {*}
       */
      checkFrontColumn(spanObj, currentCol, currentColStartIndex) {
        const colParentFieldMap = this.colParentFieldMap
        const parentFieldName = colParentFieldMap[currentCol]
        if (!parentFieldName) {
          //没有父级列（第一列）
          return true
        }
        const pSpanNum = this.getParentColSpanRowStartNum(
          0,
          spanObj,
          parentFieldName,
          currentColStartIndex
        ) // 父级列的合并行数
        const pSpanStartIndex = this.getParentColSpanRowStartIndex(
          0,
          spanObj,
          parentFieldName,
          currentColStartIndex
        ) // 父级列的合并起始列
        const sum = 0
        const cSpanSum = this.currentColSpanSum(
          pSpanStartIndex,
          spanObj,
          sum,
          currentColStartIndex,
          currentCol
        ) // 当前列的累积合并行数（在其父节点之下的）
        if (cSpanSum + 1 > pSpanNum) {
          return false
        }
        return true
      },

      /**
       * @description: 获取当前列的累积合并行数（在其父节点之下的累积行数）
       * @param {*} pSpanStartIndex 父级列的合并开始行号
       * @param {*} spanObj 合并对象
       * @param {*} sum 累积合并数
       * @param {*} currentColStartIndex 当前列的合并开始行号
       * @param {*} currentFielName 当前列名
       * @return {*}
       */
      currentColSpanSum(
        pSpanStartIndex,
        spanObj,
        sum,
        currentColStartIndex,
        currentFielName
      ) {
        sum += spanObj[currentFielName][pSpanStartIndex]
        pSpanStartIndex++
        if (pSpanStartIndex <= currentColStartIndex) {
          sum = this.currentColSpanSum(
            pSpanStartIndex,
            spanObj,
            sum,
            currentColStartIndex,
            currentFielName
          )
        }
        return sum
      },

      /**
       * @description: 获取父级列的合并单元格的起始行的合并数量
       * @param {*} value 当前行的合并单元格数
       * @param {*} spanObj 合并单元格的控制对象
       * @param {*} parentFieldName 前一列的列名
       * @param {*} rowIndex 当前行号
       * @return {*}
       */
      getParentColSpanRowStartNum(value, spanObj, parentFieldName, rowIndex) {
        value = spanObj[parentFieldName][rowIndex]
        if (value === 0) {
          value = this.getParentColSpanRowStartNum(
            value,
            spanObj,
            parentFieldName,
            rowIndex - 1
          )
        }
        return value
      },

      /**
       * @description: 获取父级列的合并单元格的起始行
       * @param {*} value 当前行的合并单元格数
       * @param {*} spanObj 合并单元格的控制对象
       * @param {*} parentFieldName 前一列的列名
       * @param {*} rowIndex 当前行号
       * @return {*}
       */
      getParentColSpanRowStartIndex(value, spanObj, parentFieldName, rowIndex) {
        value = spanObj[parentFieldName][rowIndex]
        if (value === 0) {
          rowIndex = this.getParentColSpanRowStartIndex(
            value,
            spanObj,
            parentFieldName,
            rowIndex - 1
          )
        }
        return rowIndex
      },

      /**
       * @description: 向上向下新增一行数据的逻辑控制
       * @param {*} type
       * @param {*} row
       * @param {*} rowIndex
       * @param {*} column
       */
      addAboveOrBelowRow(type, row, rowIndex, column) {
        // 1.获取右键单元格的相关信息
        const fieldName = column.field //字段名
        // 2.构造一行新数据
        const currentRow = this.tableData[rowIndex]
        // 3.添加一行空数据
        const currentPrimaryId = currentRow[this.colConfigMap[fieldName].id]
        const primaryField = this.colConfigMap[fieldName].primaryField
        const parentField = this.colParentFieldMap[primaryField]
        let parentId
        if (parentField) {
          parentId = currentRow[this.colConfigMap[parentField].id]
        }
        if (type === 'ADD_ROW_BELOW') {
          // 向下
          this.createEmptyTree(
            fieldName,
            false,
            type,
            currentPrimaryId,
            rowIndex,
            parentId
          )
        } else {
          this.createEmptyTree(
            fieldName,
            false,
            type,
            currentPrimaryId,
            rowIndex,
            parentId
          )
        }
      },

      /**
       * @description: 底部新增一行
       */
      addNewRow() {
        this.createEmptyTree(this.primaryColNameList[0], true)
      },

      /**
       * @description: 根据传入的字段名，构建一个从当前列往后的空tree（新增一行空数据）
       * @param {*} fieldName 从哪一列开始起新增空行
       * @param {*} type 向上插入 or 向下插入
       * @param {*} currentPrimaryId 当前主键id
       * @param {*} startRowIndex 右键单元格的行号
       * @param {*} startRowIndex 父级主键列的id
       * @return {*}
       */
      async createEmptyTree(
        fieldName,
        addNewRow,
        type,
        currentPrimaryId,
        startRowIndex,
        parentId
      ) {
        // 1.构造空树
        const primaryField = this.colConfigMap[fieldName].primaryField
        let primaryArr = [...this.primaryColNameList]
        const index = primaryArr.indexOf(primaryField)
        primaryArr = primaryArr.slice(index)
        const treeObj = this.generateTreeObj(primaryArr)
        // 2.发送请求
        const param = {
          criteria: treeObj, // 空树
          leafCriteriaIds: [], // 选中的数据相关的叶子节点
          allCriteriaIds: [], // 所有需要被 ”删除“ 的节点id
          rootCriteriaId: '', // 所有需要被 ”删除“ 的 “根” 节点id
          criteriaTypes: this.selectType, // 视图维度
        }
        if (!addNewRow) {
          this.createParam(param, fieldName, startRowIndex)
        }
        if (parentId) param.criteria.criteria.parentId = parentId
        if (type && type === 'ADD_ROW_ABOVE') param.beforeId = currentPrimaryId
        if (type && type === 'ADD_ROW_BELOW') param.afterId = currentPrimaryId
        await standardApi.createCriteria(param)
        if (!addNewRow) {
          this.selectionObj = {
            rowIndex: startRowIndex,
            fieldName: fieldName,
            type: type,
          }
        }
        await this.getTableData()
        this.handleSelection()
      },

      /**
       * @description: 构造一棵空树
       * @param {*} primaryArr
       * @return {*}
       */
      generateTreeObj(primaryArr) {
        const fieldName = primaryArr.shift()
        const treeObject = {
          criteria: {
            fieldName: fieldName,
            criteriaType: this.colConfigMap[fieldName].type,
            key: '',
          },
          childrenCriteria: [],
        }
        if (primaryArr && primaryArr.length > 0) {
          const childTreeObject = this.generateTreeObj(primaryArr)
          treeObject.childrenCriteria.push(childTreeObject)
        }
        return treeObject
      },

      /**
       * @description: 上下移动行
       * @param {*} type
       * @param {*} row
       * @param {*} rowIndex
       * @param {*} column
       */
      async moveAboveOrBelowRow(type, row, rowIndex, column) {
        const fieldName = column.field //字段名
        // 1.校验
        const primaryField = this.colConfigMap[fieldName].primaryField
        const parentFieldName = this.colParentFieldMap[primaryField]
        if (parentFieldName) {
          // 如果有父级列
          const parentStartRowIndex = this.getParentColSpanRowStartIndex(
            0,
            this.spanObj,
            parentFieldName,
            rowIndex
          )
          const parentEndRowIndex =
            parentStartRowIndex +
            this.spanObj[parentFieldName][parentStartRowIndex] -
            1
          if (type === 'MOVE_ABOVE' && rowIndex === parentStartRowIndex) {
            this.$message.error('到头了')
            return
          }
          if (type === 'MOVE_BELOW' && rowIndex === parentEndRowIndex) {
            this.$message.error('到底了')
            return
          }
        }
        if (type === 'MOVE_ABOVE') {
          if (rowIndex === 0) {
            this.$message.error('到表格头了')
            return
          }
        }
        if (type === 'MOVE_BELOW') {
          if (rowIndex === this.tableData.length - 1) {
            this.$message.error('到表格底了')
            return
          }
        }
        // 2.获取需要互换位置的两行数据
        const currentRow = this.tableData[rowIndex]
        const currentPrimaryId = currentRow[this.colConfigMap[fieldName].id]
        const index =
          type === 'MOVE_ABOVE'
            ? rowIndex - 1
            : rowIndex + this.spanObj[fieldName][rowIndex]
        const criteriaId2 =
          this.tableData[index][this.colConfigMap[fieldName].id]
        // 3.发送请求
        const param = {
          criteriaId1: currentPrimaryId,
          criteriaId2: criteriaId2,
          criteriaTypes: this.selectType,
        }
        await standardApi.updateCriteriaOrder(param)
        this.selectionObj = {
          rowIndex: rowIndex,
          fieldName: fieldName,
          type: type,
        }
        await this.getTableData()
        this.handleSelection()
      },

      /**
       * @description: 修改标准
       * @param {*} row
       * @param {*} column
       * @param {*} changeValue
       */
      async editStandard(row, column, changeValue) {
        if (Object.prototype.hasOwnProperty.call(column, 'relateCriteriaId')) {
          const relateCriteriaId = column.relateCriteriaId
          const param = {
            criteriaId1: row[relateCriteriaId[0]],
            criteriaId2: row[relateCriteriaId[1]],
            params: JSON.stringify({
              ROIs: changeValue ? changeValue.trim() : changeValue,
            }),
          }
          await standardApi.saveCriteriaRelate(param)
        } else {
          let obj = {}
          if (column.isPrimaryCol) {
            obj = {
              id: row[column.id],
              key: row[column.field]
                ? row[column.field].trim()
                : row[column.field],
              criteriaType: column.type,
            }
          } else {
            const params = {}
            const paramArr = this.masterParamsMap[column.id]
            debugger
            paramArr.forEach((item) => {
              params[item] = row[item]
            })
            params[column.field] = changeValue
              ? changeValue.trim()
              : changeValue
            obj = {
              id: row[column.id],
              params: JSON.stringify(params),
              criteriaType: column.type,
            }
          }
          if (!obj.id) {
            this.$message.error('id为空不可编辑，请联系管理员')
            return
          }
          await standardApi.updateCriteria({
            criteria: obj,
            criteriaTypes: this.selectType,
          })
        }
        // todo 刷新导致编辑框失效
        this.getTableData()
      },

      /**
       * @description: 删除标准
       * @param {*} type
       * @param {*} row
       * @param {*} rowIndex
       * @param {*} column
       */
      async deleteStandard(type, row, rowIndex, column) {
        this.$confirm(
          translate('确认删除当前单元格模块列及其后续列的数据'),
          translate('提示'),
          {
            confirmButtonText: translate('确认'),
            cancelButtonText: translate('取消'),
            type: 'warning',
          }
        ).then(async () => {
          const fieldName = column.field //字段名
          const param = {
            leafCriteriaIds: [], // 选中的数据相关的叶子节点
            allCriteriaIds: [], // 所有需要被 ”删除“ 的节点id
            rootCriteriaId: '', // 所有需要被 ”删除“ 的 “根” 节点id
            criteriaTypes: this.selectType, // 视图维度
          }
          this.createParam(param, fieldName, rowIndex)
          await standardApi.deleteCriteria(param)
          this.selectionObj = {
            rowIndex: rowIndex,
            fieldName: fieldName,
            type: type,
          }
          await this.getTableData()
          await this.handleSelection()
        })
      },

      /**
       * @description: 删除、新增的请求参数体构造
       * @param {*} param
       * @param {*} fieldName
       * @param {*} startRowIndex
       * @return {*}
       */
      createParam(param, fieldName, startRowIndex) {
        // 1. 准备数据
        let allCriteriaIds = []
        let arr1 = []
        let arr2 = []
        let arr3 = []
        const startIndex = this.primaryColNameList.indexOf(
          this.colConfigMap[fieldName].primaryField
        )
        const slicedArr = this.primaryColNameList.slice(startIndex) // 要删除的所有主键列名
        const deleteRowNum = this.spanObj[fieldName][startRowIndex] // 要删除的行数
        for (let i = 0; i < deleteRowNum; i++) {
          const row = this.tableData[startRowIndex + i]
          //要删除的id
          slicedArr.forEach((field, index) => {
            const idFieldName = this.colConfigMap[field].id
            allCriteriaIds.push(row[idFieldName])
          })

          // 按展示顺序，构建叶子节点数组 [[...],[...],[...]]
          this.leafNodeFieldList.forEach((field, index) => {
            const primaryField = this.colConfigMap[field].primaryField
            const leafNodeField = this.colConfigMap[primaryField].leafNodeField
            const leafNodeIdName = this.colConfigMap[leafNodeField].id
            if (index === 0) {
              arr1.push(row[leafNodeIdName])
            }
            if (index === 1) {
              arr2.push(row[leafNodeIdName])
            }
            if (index === 2) {
              arr3.push(row[leafNodeIdName])
            }
          })
        }
        // 2. 设置param
        arr1 = Array.from(new Set(arr1))
        arr2 = Array.from(new Set(arr2))
        arr3 = Array.from(new Set(arr3))
        allCriteriaIds = Array.from(new Set(allCriteriaIds))
        param.leafCriteriaIds.push({ ids: arr1 })
        param.leafCriteriaIds.push({ ids: arr2 })
        param.leafCriteriaIds.push({ ids: arr3 })
        param.allCriteriaIds = allCriteriaIds
        param.rootCriteriaId = allCriteriaIds[0]
      },

      /**
       * @description: 删除组合检测标准
       * @return {*}
       */
      async deleteGroupCriteria(data, obj, isCameraCode) {
        const param = {
          ids: [],
        }
        if (isCameraCode) {
          param.ids.push(`${data.id}`)
        } else {
          const deleteValueArr = this.convertToArr(data)
          const deleteIdArr = []
          deleteValueArr.forEach((item) => {
            deleteIdArr.push(obj[item])
          })
          param.ids = deleteIdArr
        }
        await standardApi.deleteGroupCriteria(param)
        this.getTableData()
      },

      /**
       * @description: input框的监听事件
       * @param {*} event
       */
      handleOnInput(event) {
        this.inputValue = event.target.value
      },

      /**
       * @description: input的按键事件
       * @param {*} event
       * @param {*} row
       * @param {*} fieldName
       */
      handleKeyDown(event, row, fieldName, rowIndex, isCameraCode) {
        if (event.key === 'Backspace') {
          // 按下删除键时执行删除逻辑
          // this.inputValue = this.inputValue.slice(0, -1)
        }
        if (event.key === 'Enter') {
          const regex = /^\d+-\d+$|^\d+$/
          if (!isCameraCode && !regex.test(this.inputValue)) {
            // 点位输入值，校验
            this.$message.error('只能输入全数字，或者1-3形式的值')
            return
          }
          // 按下回车键时执行保存逻辑
          isCameraCode
            ? this.addGroupCameraCode(row, fieldName, rowIndex)
            : this.addGroupPoint(row, fieldName, rowIndex)
        }
      },

      /**
       * @description: 将 1-4 形式的数组转化为连续的[1,2,3,4,]
       * @param {*} data
       * @return {*}
       */
      convertToArr(data) {
        let newArr = data.split('-')
        if (newArr.length > 1) {
          const start = parseInt(newArr[0])
          const end = parseInt(newArr[1])
          newArr = []
          for (let i = start; i <= end; i++) {
            newArr.push(i)
          }
        }
        return newArr
      },

      /**
       * @description: 添加组合检测标准
       * @param {*} row
       * @param {*} fieldName
       * @return {*}
       */
      async addGroupCameraCode(row, fieldName, rowIndex) {
        const fieldValueArr = row[this.colConfigMap[fieldName].key]
        const masterId = fieldValueArr[0].id
        const masterKey = fieldValueArr[0].key
        if (fieldValueArr.length === 1 && !masterKey) {
          // 更新
          const obj = {
            id: masterId,
            key: this.inputValue.trim(),
            criteriaType: this.colConfigMap[fieldName].type,
          }
          await standardApi.updateCriteria({
            criteria: obj,
            criteriaTypes: this.selectType,
          })
        } else {
          // 新增
          const param = {
            criteriaKeys: [],
            masterCriteriaId: '',
          }
          param.masterCriteriaId = row[this.colConfigMap[fieldName].id]
          param.criteriaKeys.push(this.inputValue)
          await standardApi.createGroupCriteria(param)
        }
        this.inputValue = ''
        this.getTableData()
      },

      /**
       * @description: 添加组合检测标准
       * @param {*} row
       * @param {*} fieldName
       * @return {*}
       */
      async addGroupPoint(row, fieldName, rowIndex) {
        const fieldValueArr = row[this.colConfigMap[fieldName].key]
        const masterId = fieldValueArr[0].id
        const masterKey = fieldValueArr[0].key
        const isUpdateBol = fieldValueArr.length === 1 && !masterKey
        // 1.处理输入，转化为数组
        const inputArr = this.convertToArr(this.inputValue)
        // 2.校验
        const firstIncludedElement = this.checkPoint(
          row,
          fieldName,
          rowIndex,
          inputArr
        )
        if (firstIncludedElement) {
          this.$message.error(
            `同一个相机下已有相同的点位${firstIncludedElement}，请重新输入`
          )
          return
        }
        // 3.更新（一开始没有值，从空值更新为有值）
        if (isUpdateBol) {
          const updateValue = inputArr[0]
          const obj = {
            id: masterId,
            key: String(updateValue),
            criteriaType: this.colConfigMap[fieldName].type,
          }
          await standardApi.updateCriteria({
            criteria: obj,
            criteriaTypes: this.selectType,
          })
          if (inputArr.length > 1) {
            inputArr.shift()
          }
        }
        // 4.新增
        if (!isUpdateBol || inputArr.length > 1) {
          const param = {
            criteriaKeys: inputArr.map((num) => String(num)),
            masterCriteriaId: '',
          }
          param.masterCriteriaId = row[this.colConfigMap[fieldName].id]
          // param.criteriaKeys.push(this.inputValue);
          await standardApi.createGroupCriteria(param)
        }
        this.inputValue = ''
        this.getTableData()
      },

      /**
       * @description: 校验点位的合法性
       * @param {*} row
       * @param {*} fieldName
       * @param {*} rowIndex
       * @param {*} inputArr
       * @return {*}
       */
      checkPoint(row, fieldName, rowIndex, inputArr) {
        const primaryField = this.colConfigMap[fieldName].primaryField
        const parentFieldName = this.colParentFieldMap[primaryField]
        const parentStartRowIndex = parseInt(
          this.getParentColSpanRowStartIndex(
            0,
            this.spanObj,
            parentFieldName,
            rowIndex
          )
        )
        const parentEndRowIndex = parseInt(
          parentStartRowIndex +
            this.spanObj[parentFieldName][parentStartRowIndex] -
            1
        )
        const oldValueArr = []
        for (let i = parentStartRowIndex; i <= parentEndRowIndex; i++) {
          this.tableData[i][fieldName].forEach((item) => {
            oldValueArr.push(item.key)
          })
        }
        const firstIncludedElement = oldValueArr.find((element) =>
          inputArr.includes(parseInt(element))
        )
        // const containsAll = oldValueArr.every((item) => inputArr.includes(item));
        return firstIncludedElement
      },

      /**
       * @description: 点击图片详情
       * @param {*} data
       * @return {*}
       */
      clickImgDetail(data) {
        console.log('点击图片详情=======', data)
        if (data) {
          this.currentRow = data
        }
        // this.$router.push({ path: '/project/standard/detail' });
        this.showDetail = true
      },

      /**
       * @description: 获取表格数据
       */
      async getTableData() {
        this.loading = true
        // 获取数据
        const { data: res } = await standardApi.treeCriteria({
          criteriaTypes: [3, 1, 2],
        })
        const dataArr = await this.convertTreeToList(res)
        this.tableData = dataArr
        // 构造合并对象（渲染页面）
        this.initSpanObj(this.tableData)
        // 显隐列处理
        this.showColumns(this.showColList)
        if (this.hideList.length !== 0) this.hideColumns(this.hideList)
        console.log('看一下数据 dataArr========：', dataArr)
        this.loading = false
      },

      /**
       * @description: 获取缩略图
       */
      async getThumbnailImg() {
        if (this.imgKeySet.size === 0) {
          return
        }
        const { data: res } = await solutionSourceApi.getMapByKey({
          hash: [...this.imgKeySet],
          imageType: 2,
        })
        for (const key in res) {
          for (const item of res[key]) {
            this.imgHashBase64[key] = item.images
          }
        }
        this.isImgLoading = false
        this.initSpanObj(this.tableData)
      },

      /**
       * @description: 显示输入框
       * @param {*} row
       * @param {*} column
       * @param {*} rowIndex
       * @return {*}
       */
      handleShowInput(row, column, rowIndex) {
        // 1.显示当前单元格输入框，隐藏其他单元格的输入框
        row[`${column.field}Edit${rowIndex}`] =
          !row[`${column.field}Edit${rowIndex}`]
        let flag = false
        if (row[`${column.field}Edit${rowIndex}`]) {
          flag = true
        }
        this.tableData.forEach((item, index) => {
          delete item[`cameraCodeEdit${index}`]
          delete item[`pointEdit${index}`]
        })
        if (flag) {
          row[`${column.field}Edit${rowIndex}`] = true
        }
        // 2.输入框在单元格中顶部对齐（避免单元格纵向过长时，无法触发显示输入框事件）
        const primaryIdField = this.colConfigMap[column.field].id
        const style = `ats-sop-${row[primaryIdField]} `
        const elements = document.querySelectorAll(`.${style}`)
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.add('cell-top')
        }
        // 3.重绘单元格选框
        this.selectionObj = {
          rowIndex: rowIndex,
          fieldName: column.field,
        }
        this.initSpanObj(this.tableData)
        nextTick(() => {
          if (flag) document.getElementById(column.field + rowIndex).focus()
        })
        this.handleSelection(row)
      },
      exportExcel_bak1() {
        const table = this.$refs['standardTableRef'].cloneNode(true)
        // const table = document.querySelector('#standardTable').cloneNode(true)
        const rows = table.querySelectorAll('tr')
        // 1. 移除第三行（第三行是空行）
        if (rows.length >= 3) {
          rows[2].remove()
        }
        // 2. 遍历单元格，将值为"查看"的单元格设置为空字符串（图像列）
        const cells = table.querySelectorAll('td')
        cells.forEach((cell) => {
          if (cell.innerText === '查看') {
            cell.innerText = ''
          }
        })

        // 创建工作簿
        const wb = XLSX.utils.table_to_book(table, { raw: true })

        // 获取表头单元格样式对象
        const headerStyle = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
          fill: {
            fgColor: { rgb: 'FF0000' }, // 设置背景色为红色
          },
        }

        // 获取单元格样式对象
        const cellStyle = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        }

        // 应用表头样式
        const ws = wb.Sheets[wb.SheetNames[0]]
        const headerRange = XLSX.utils.decode_range(ws['!ref'])
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const headerCell =
            ws[XLSX.utils.encode_cell({ r: headerRange.s.r, c: col })]
          if (!headerCell) {
            continue
          }
          headerCell.s = Object.assign(headerCell.s || {}, headerStyle)
        }

        // 应用单元格样式
        const dataRange = XLSX.utils.decode_range(ws['!ref'])
        for (let row = dataRange.s.r + 1; row <= dataRange.e.r; row++) {
          for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })]
            if (!cell) {
              continue
            }
            cell.s = Object.assign(cell.s || {}, cellStyle)
          }
        }

        // 导出
        const wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array',
        })
        const fileName = `${translate('i18_sop_manage')}_${dayjs().format(
          'YYYY-MM-DD'
        )}`
        try {
          FileSaver.saveAs(
            new Blob([wbout], { type: 'application/octet-stream' }),
            `${fileName}.xlsx`
          )
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        return wbout
      },

      /**
       * @description: 导出excel
       */
      exportExcel() {
        const table = document.querySelector('#standardTable').cloneNode(true)
        // 1.遍历单元格，将值为"查看"的单元格设置为空字符串（图像列）
        const cells = table.querySelectorAll('td')
        cells.forEach((cell) => {
          if (cell.innerText === '查看') {
            cell.innerText = ''
          }
        })
        // 2.导出
        const wb = XLSX.utils.table_to_book(table, { raw: true })
        const fileName = `${translate('标准管理')}_${dayjs().format(
          'YYYYMMDDHHmmss'
        )}`
        const wbout = XLSX.write(wb, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array',
        })
        try {
          FileSaver.saveAs(
            new Blob([wbout], { type: 'application/octet-stream' }),
            `${fileName}.xlsx`
          )
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        return wbout
      },

      async exportExcel_bak() {
        // 创建工作簿和工作表
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Sheet 1')

        // 添加表头
        worksheet.addRow(this.allColNameList)

        // 添加数据行
        this.tableData.forEach((row) => {
          const values = Object.values(row)
          const rowCells = worksheet.addRow(values)
        })

        // 保存 Excel 文件
        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), `${translate('i18_sop_manage')}_${dayjs()}`)
      },

      /**
       * 打开侧边栏
       */
      openDrawer() {
        this.isShowDrawer = true
      },

      /**
       * @description:获取用户项目设置信息
       */
      async getUserProjectConfig() {
        const { data } = await configApi.getUserProjectConfig({})
        if (data) {
          this.userConfig = data || {}
          if (this.userConfig && this.userConfig.solutionSopConfig) {
            const solutionSopConfigObj = JSON.parse(
              this.userConfig.solutionSopConfig
            )
            if (solutionSopConfigObj) {
              for (const key in solutionSopConfigObj) {
                this.dbColConfig[key] = solutionSopConfigObj[key].config || {}
              }
            }
          }
        }
        console.log('this.userConfig======', this.userConfig)
        console.log('this.dbColConfig======', this.dbColConfig)
      },

      async restoreDefault() {
        if (this.userConfig) {
          this.userConfig.solutionSopConfig = ''
        } else {
          this.userConfig = {}
          this.userConfig.solutionSopConfig = ''
        }
        await configApi.saveOrUpdateUserProjectConfig(this.userConfig)
        this.init()
        this.showColumns(this.showColList)
        if (this.hideList.length !== 0) this.hideColumns(this.hideList)
        this.isShowDrawer = false
      },

      /**
       * @description: 保存配置（列显隐）
       * @return {*}
       */
      async saveOrUpdateUserProjectConfig(fieldName, width) {
        if (this.userConfig && this.userConfig.solutionSopConfig) {
          // 1.如果是数据库有配置
          const solutionSopConfigObj = JSON.parse(
            this.userConfig.solutionSopConfig
          )
          if (!solutionSopConfigObj[this.selectType]) {
            solutionSopConfigObj[this.selectType] = {}
          }
          // 1.1 保存显示配置
          solutionSopConfigObj[this.selectType].show = this.showColList
          if (fieldName) {
            // 1.2保存列的配置
            const config = solutionSopConfigObj[this.selectType].config || {}
            config[fieldName] = {}
            config[fieldName].width = width
            solutionSopConfigObj[this.selectType].config = config
          }
          this.userConfig.solutionSopConfig =
            JSON.stringify(solutionSopConfigObj)
        } else {
          // 2.数据库没有配置，则新增配置
          const obj = {
            [this.selectType]: {},
          }
          // 2.1 保存显示配置
          obj[this.selectType].show = this.showColList
          if (fieldName) {
            // 2.2保存列的配置
            obj[this.selectType].config = {}
            obj[this.selectType].config[fieldName] = {}
            obj[this.selectType].config[fieldName].width = width
          }
          this.userConfig.solutionSopConfig = JSON.stringify(obj)
        }
        const { data: res } = await configApi.saveOrUpdateUserProjectConfig(
          this.userConfig
        )
      },

      /**
       * @description: 列宽拖动发生变化时会触发事件
       * @param {*} column
       * @return {*}
       */
      resizableChange({ column }) {
        console.log('column=======', column)
        this.saveOrUpdateUserProjectConfig(
          column.field,
          this.$refs['standardTableRef'].getColumnWidth(column.field)
        )
      },

      /**
       * @description: 单元格编辑的回车事件
       * @param {*} event
       * @param {*} row
       * @param {*} column
       * @param {*} rowIndex
       * @return {*}
       */
      enterEvent(event, row, column, rowIndex) {
        if (event.$event.key === 'Enter' || event.$event.key === 'Escape') {
          this.$refs['standardTableRef'].clearEdit()
          this.$refs['standardTableRef'].setSelectCell(row, column.field)
          this.selectRowIndex = rowIndex
          this.selectColumnField = column.field
        }
      },

      /**
       * @description: 单元格编辑状态下被关闭时会触发该事件
       * @param {*} row
       * @param {*} column
       * @return {*}
       */
      editClosed({ row, column }) {
        // 相同id的元素会一起修改，发送修改请求则去掉高亮背景色
        const primaryIdField = this.colConfigMap[column.field].id
        const style = `ats-sop-${row[primaryIdField]} `
        const elements = document.querySelectorAll(`.${style}`)
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove('cell-edit-background')
        }
        // 修改
        const changeValue = row[column.field]
        if (
          column.field === 'picNum' &&
          changeValue &&
          !/(^[1-9]\d*$)/.test(changeValue)
        ) {
          this.$message.error('图片数量只能输入正整数')
          return false
        }
        this.editStandard(row, this.colConfigMap[column.field], changeValue)
        // 还原编辑框的样式
        nextTick(() => {
          const vxeCells = document.querySelectorAll('.vxe-cell')
          vxeCells.forEach((vxeCell) => {
            vxeCell.style.padding = '0px 10px'
            vxeCell.style.removeProperty('height')
          })
        })
      },

      /**
       * @description: 单元格点击事件
       * @param {*} row
       * @return {*}
       */
      cellClick({ row }) {
        const a = this.$refs['standardTableRef'].getSelectedCell()
        console.log('选择事件触发=======', a)
      },

      /**
       * @description: 单元格被激活编辑时会触发该事件
       * @param {*} row
       * @param {*} column
       * @return {*}
       */
      editActived({ row, column }) {
        row[`${column.field}Edit`] = true
        // 相同id的元素会一起修改，加上统一的高亮背景色
        const primaryIdField = this.colConfigMap[column.field].id
        const style = `ats-sop-${row[primaryIdField]} `
        const elements = document.querySelectorAll(`.${style}`)
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.add('cell-edit-background')
        }
        // 更改编辑框的样式
        nextTick(() => {
          const vxeCells = document.querySelectorAll('.vxe-cell')
          vxeCells.forEach((vxeCell) => {
            const vxeInput = vxeCell.querySelector('.vxe-input')
            if (vxeInput) {
              vxeCell.style.height = `${vxeCell.parentElement.clientHeight}px`
              vxeCell.style.padding = '0'
            }
          })
        })
      },

      /**
       * @description: 表头的单元格样式控制
       * @param {*} rowIndex
       * @return {*}
       */
      headerCellClassName({ $rowIndex }) {
        if ($rowIndex === 0) {
          return 'table-header-cell'
        }
        if ($rowIndex === 1) {
          return 'table-sub-header-cell'
        }
        return null
      },

      /**
       * @description: 表格体的单元格样式控制
       * @param {*} row
       * @param {*} column
       * @param {*} rowIndex
       * @param {*} columnIndex
       * @return {*}
       */
      cellClassName({ row, column, rowIndex, columnIndex }) {
        if (column.type === 'seq') {
          return 'table-header-cell'
        } else {
          const primaryIdField = this.colConfigMap[column.field].id
          let style = `ats-sop-${row[primaryIdField]} `
          if (
            this.selectRowIndex === rowIndex &&
            this.selectColumnField === column.field
          ) {
            style += 'col--selected '
          }
          return style + this.primaryColStyleMap[column.field]
        }
      },

      /**
       * @description: 右键菜单点击事件
       * @param {*} menu
       * @param {*} row
       * @param {*} rowIndex
       * @param {*} column
       * @return {*}
       */
      contextMenuClickEvent({ menu, row, rowIndex, column }) {
        switch (menu.code) {
          case 'ADD_ROW_ABOVE':
          case 'ADD_ROW_BELOW':
            this.addAboveOrBelowRow(menu.code, row, rowIndex, column)
            break
          case 'DELETE_ROW':
            this.deleteStandard(menu.code, row, rowIndex, column)
            break
          case 'MOVE_ABOVE':
          case 'MOVE_BELOW':
            this.moveAboveOrBelowRow(menu.code, row, rowIndex, column)
            break
          default:
            console.log('点击菜单======', menu, row, column)
        }
      },

      /**
       * @description: 初始化
       */
      async init() {
        this.imgHashBase64 = {}
        const val = getStore({ name: 'standardType' })
        if (Array.isArray(val)) {
          console.log('==========val 是数组')
        }
        // 选择展示维度
        const selectObj = selectOptions.find(
          (el) => el.value?.join('') === val?.join('')
        )
        this.selectType = val ? selectObj.value : selectOptions[0].value
        console.log('初始化进来了============', val, this.selectType)
        await this.getUserProjectConfig()
        await this.changeType()
      },
      /**
       *移除SOP成功刷新主页
       */
      removeSopSuccess() {
        this.init()
      },
    },
  }
</script>
<style lang="scss">
  :root {
    --vxe-table-border-color: #cbcbcb; /* 覆盖表格分割线的变量 */
  }
  .table-header-cell {
    background-color: #dddddd !important;
    // color: #fff !important;
    // background-color: #8d8d8d !important;
  }

  .table-sub-header-cell {
    background-color: #f5f5f5;
  }

  .table-body-cell-primary {
    background-color: #f5f5f5 !important;
  }
</style>
<style lang="scss" scoped>
  #standardTable {
    height: calc(100% - 47px);
  }
  .standard-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 15px;
  }

  :deep() {
    .vxe-table--render-default .vxe-body--column.col--selected {
      box-shadow: inset 0 0 0 2px var(--el-color-primary-light-1);
    }
    .vxe-cell {
      text-align: center !important;
      .vxe-input {
        height: 100%;
        .vxe-input--inner {
          padding: 0 8px;
          border: 2px solid var(--el-color-primary-light-1);
          border-radius: 0px;
        }
      }
    }
    .vxe-icon-edit {
      display: none;
    }
    // TODO 没生效
    .standard-menus {
      border: 0px solid var(--vxe-table-popup-border-color) !important;
      box-shadow: none !important;
    }

    .el-tag {
      padding: 2px 0px;
      margin-right: 2px;
      margin-bottom: 2px;
      margin-left: 0px !important;
      .el-icon-close {
        height: 13px;
      }
    }

    .el-tag.custom-tag {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .custom-tag .el-tag__close {
      order: -1;
      margin-right: 6px;
    }

    .el-loading-mask {
      z-index: 2;
    }

    .el-checkbox {
      height: 25px;
    }

    .el-drawer__body {
      padding: 0;
    }

    .sop-img-content {
      padding-top: 5px;
      overflow-x: auto;
      white-space: nowrap;
    }

    .sop-img-content::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    .sop-img-content::-webkit-scrollbar-thumb {
      background-color: #ddd;
      border-radius: 3px;
    }

    .sop-img-content::-webkit-scrollbar-track {
      background-color: #f0f0f0;
    }

    .cell-edit-background {
      background-color: var(--el-color-primary-light-1) !important;
    }
  }

  .img-view {
    width: 100px;
    height: 100px;
    margin-right: 5px;
  }

  .input-css {
    width: 100%;
    height: 27px;
  }

  .sop-cell-content {
    display: flex;
    flex-direction: column;
    margin: 5px 0;
  }

  .cell-top {
    vertical-align: top;
  }

  .table-title {
    // 最外层容器 用来包裹需要展示 title 属性的
    .title[data-title] {
      // data-title 在我们需要加title属性的标签内 换成 data-title='张三'
      position: relative;
      cursor: pointer;

      // 样式：
      &:hover:after {
        visibility: visible;
        opacity: 1;
        transition: all 0.1s ease 0.5s;
      }
      // 具体控制title背景的样式 位置 字体等
      &:after {
        position: absolute;
        bottom: 20px;
        left: 50px;
        z-index: 9999999;
        padding: 4px 10px;
        font-size: 10px;
        color: #838383;
        white-space: nowrap;
        visibility: hidden;
        content: attr(data-title);
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 1px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.16);
        opacity: 0;
      }
    }
  }
</style>
