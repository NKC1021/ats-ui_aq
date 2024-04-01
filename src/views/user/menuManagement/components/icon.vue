<template>
  <div>
    <span
      class="gva-icon"
      style="position: absolute; z-index: 9999; padding: 3px 10px 0"
    >
      <vab-icon :icon="metaData" />
    </span>
    <el-select
      v-model="metaData"
      class="gva-select"
      clearable
      filterable
      placeholder="请选择"
      style="width: 100%"
    >
      <el-option
        v-for="item in options"
        :key="item.key"
        class="select__option_item"
        :label="item.key"
        :value="item.key"
      >
        <vab-icon :icon="item.key" />
        <span style="text-align: left">{{ item.key }}</span>
      </el-option>
    </el-select>
  </div>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useI18n } from 'vue-i18n' // added by mohamed hassan to support multilanguage
  import { sysIcon, aqs } from '@/const/icon'

  const { t } = useI18n() // added by mohamed hassan to support multilanguage

  const props = defineProps({
    meta: {
      default: function () {
        return '24-hours-fill'
      },
      type: String,
    },
  })
  const emits = defineEmits(['update:meta'])
  const options = reactive([])
  sysIcon.forEach((item) => {
    options.push({
      key: item,
      label: item,
    })
  })

  const metaData = ref(props.meta)
  if (!metaData.value) {
    metaData.value = options[0].label
    emits('update:meta', metaData.value)
  }
  watch(
    () => metaData.value,
    (newVal) => {
      if (!newVal) {
        metaData.value = options[0].label
        emits('update:meta', metaData.value)
      } else {
        emits('update:meta', newVal)
      }
    }
  )
  watch(
    () => props.meta,
    (newVal) => {
      metaData.value = newVal
    }
  )
</script>

<script>
  export default {
    name: 'Icon',
  }
</script>

<style lang="scss">
  .gva-icon {
    margin-right: 10px;
    font-size: 14px;
    color: rgb(132, 146, 166);
  }

  .gva-select .el-input__inner {
    padding: 0 30px !important;
  }

  .select__option_item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
</style>
