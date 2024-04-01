<!--  -->
<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :title="translate('修改信息')"
      width="650px"
    >
      <el-form label-width="80px" :model="updateForm">
        <el-form-item :label="translate('机台')">
          <el-input v-model="updateForm.machineName" />
        </el-form-item>
        <el-form-item :label="translate('工厂')">
          <el-input v-model="updateForm.factoryName" />
        </el-form-item>
        <el-form-item :label="translate('线体')">
          <el-input v-model="updateForm.lineName" />
        </el-form-item>
        <el-form-item :label="translate('工位')">
          <el-select
            v-model="updateForm.stationName"
            allow-create
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in stationList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('相机名')">
          <el-select
            v-model="updateForm.cameraName"
            allow-create
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in cameraList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('采图点位')">
          <el-select
            v-model="updateForm.capturePos"
            allow-create
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in captureList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('光照ID')">
          <el-select
            v-model="updateForm.opticalMode"
            allow-create
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in opticalList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">
          {{ translate('取消') }}
        </el-button>
        <el-button type="primary" @click="updateImgInfo">
          {{ translate('确定') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      criteriaData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    emits: ['update:show', 'updateImgInfo'],
    data() {
      return {
        updateForm: {
          machineName: '',
          factoryName: '',
          lineName: '',
          cameraName: '',
          stationName: '',
          opticalMode: '',
          capturePos: '',
        },
      }
    },
    computed: {
      translate() {
        return translate
      },
      dialogVisible: {
        get() {
          return this.show
        },
        set(newVal) {
          this.$emit('update:show', newVal)
        },
      },
      cameraList() {
        const _list = this.criteriaData.cameraCodeSet
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      stationList() {
        const _list = this.criteriaData.stationSet
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      opticalList() {
        const _list = this.criteriaData.opticsSet
        if (_list) {
          return _list
        } else {
          return []
        }
      },
      captureList() {
        const _list = this.criteriaData.pointSet
        if (_list) {
          return _list
        } else {
          return []
        }
      },
    },
    watch: {
      dialogVisible(newVal) {
        if (!newVal) {
          //
          this.updateForm = {
            machineName: '',
            factoryName: '',
            lineName: '',
            cameraName: '',
            stationName: '',
            opticalMode: '',
            capturePos: '',
          }
        }
      },
    },

    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      handleClose() {
        this.dialogVisible = false
      },
      updateImgInfo() {
        const query = {}
        Object.keys(this.updateForm).forEach((el) => {
          if (this.updateForm[el]) {
            query[el] = this.updateForm[el]
          }
        })
        if (JSON.stringify(query) === '{}') {
          return this.$message.error('条件置空不会作出修改')
        }
        this.$emit('updateImgInfo', query)
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
