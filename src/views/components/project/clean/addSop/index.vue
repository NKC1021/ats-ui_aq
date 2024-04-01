<template>
  <div class="content">
    <div v-show="isMultipleSelectedImg" class="body">
      <el-form label-width="66px" :model="addSopForm">
        <el-form-item label="标准类型" prop="criteriaType">
          <el-radio-group v-model="addSopForm.criteriaType">
            <el-radio :label="1">客户缺陷</el-radio>
            <el-radio :label="2">AI工程</el-radio>
            <el-radio :label="3">光学方案</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="标签" prop="labelName">
          <el-select style="width: 100%" v-model="addSopForm.labelName">
            <el-option v-for="(item, index) in imgLabels" :key="index" :label="item.labelName" :value="item.labelName"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <div v-if="addSopForm.criteriaType !== 3" class="table-content">
        <!-- {{ imgLabels }} -->
        <el-table
          border
          :cell-style="cellStyle"
          :data="imgLabels"
          height="100%"
          :row-style="rowStyle"
          @cell-click="tableCellClick"
        >
          <el-table-column :label="translate('标签名')">
            <template #default="scope">
              {{ labelNameByEnableType(scope.row) }}
            </template>
          </el-table-column>

          <el-table-column v-if="isConnect" :label="translate('关联')" />
          <el-table-column v-if="!isConnect" :label="translate('不关联')" />
          <template #empty>
            <el-empty />
          </template>
        </el-table>
      </div>
      <div v-show="addSopForm.criteriaType === 3" style="text-align: center">
        <el-button type="primary" @click="addSopSubmit">
          {{ translate('确认') }}
        </el-button>
        <el-button>{{ translate('重置') }}</el-button>
      </div>
    </div>
    <div v-show="!isMultipleSelectedImg" class="clear-ss">
      <el-empty :description="translate('请选择一张图片')" />
    </div>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  import solutionSource from '@/api/solutionSource'
  export default {
    props: {
      selectedImgInfo: {
        type: Object,
        default: () => {},
      },
      isMultipleSelectedImg: {
        type: Boolean,
        default: false,
      },
      isConnect: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        cellStyle: {
          textAlign: 'center',
        },
        rowStyle: {
          height: '25px',
        },
        addSopForm: {
          criteriaType: 1,
          labelName: '',
        },
        passTypeObj: {
          1: '可放行',
          2: '不确定',
          3: '不可放行',
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      imgLabels() {
        const { labels } = this.selectedImgInfo
        const { criteriaType } = this.addSopForm
        if (labels && labels.length) {
          return labels
            .filter((el) => !criteriaType || el.labelType === criteriaType)
            .filter(
              (label, index, self) =>
                index ===
                self.findIndex(
                  (l) =>
                    l.labelName === label.labelName &&
                    l.passType === label.passType
                )
            )
        }
        return []
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},

    methods: {
      /**
       * 标签名称处理
       *
       */
      labelNameByEnableType(rowInfo) {
        const _type = this.addSopForm.criteriaType
        const _passType = rowInfo.passType
          ? this.passTypeObj[`${rowInfo.passType}`]
          : ''
        const infoList = []
        if (_type === 2) {
          infoList.push(rowInfo.enginName)
        }
        infoList.push(rowInfo.labelName)
        infoList.push(_passType)
        const _labelName = infoList.filter((el) => el).join('-')
        return _labelName
      },
      /**
       * 发起关联标准请求
       * @param condition
       */
      async associateCriteria(condition) {
        const res = await solutionSource.associateCriteria(condition)
        if (res.code === 0) {
          this.$message.success(res.msg)
        }
      },
      /**
       * 添加SOP
       */
      addSopSubmit() {
        //
        const query = {
          criteriaType: this.addSopForm.criteriaType,
          sourceInfo: { ...this.selectedImgInfo },
        }
        this.associateCriteria(query)
      },
      /**
       * 表格单元格点击
       */
      tableCellClick(row, column) {
        if (['关联', '不关联'].includes(column.label)) {
          const _keys = [
            'cameraName',
            'capturePos',
            'opticalMode',
            'stationName',
            'id',
          ]
          const query = {
            criteriaType: this.addSopForm.criteriaType,
            sourceInfo: {},
          }
          _keys.forEach((el) => {
            query.sourceInfo[el] = this.selectedImgInfo[el]
          })
          switch (this.addSopForm.criteriaType) {
            case 1: {
              query.labelName = row.labelName
              query.passType = row.passType
              break
            }
            case 2: {
              query.enginName = row.enginName
              query.labelName = row.labelName
              query.passType = row.passType
              break
            }
          }
          console.log('query', query)
          this.associateCriteria(query)
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* @import url(); 引入css类 */
  .content {
    width: 100%;
    height: 100%;
    border: 1px solid #ebeef5;
    .body {
      height: 100%;
      padding: 10px;
    }
    .table-content {
      height: calc(100% - 50px);
    }
    .clear-ss {
      display: flex;
      justify-content: center;
      height: 100%;
    }
  }

  :deep() {
    .el-form-item__content {
      margin-left: 20px;
    }
  }
</style>
