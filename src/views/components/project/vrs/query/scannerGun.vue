<!--  -->
<template>
  <el-input
    ref="inputRef"
    v-model="scannerVal"
    clearable
    :placeholder="translate('支持扫码枪接入')"
    @blur="inputBlur"
    @focus="inputFocus"
    @keydown="inputKeyDown"
  />
</template>

<script>
  import { translate } from '@/i18n'
  export default {
    props: {
      modelValue: {
        type: String,
        default: '',
      },
    },
    emits: ['update:modelValue', 'focus', 'blur', 'snfinish'],
    data() {
      return {
        timer: null,
      }
    },
    computed: {
      scannerVal: {
        get() {
          return this.modelValue
        },
        set(newVal) {
          this.$emit('update:modelValue', newVal)
        },
      },
      translate() {
        return translate
      },
    },
    //生命周期 - 创建完成（访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（访问DOM元素）
    mounted() {},
    methods: {
      inputKeyDown(e) {
        // console.log('eeee:::', e.target.value)
        // console.log('eeee:::', e.key)
        if (e.key === 'Enter') {
          this.$nextTick(() => {
            this.$emit('snfinish')
            this.timer && clearTimeout(this.timer)
            this.timer = setTimeout(() => this.$refs.inputRef.select(), 1000)})
        }
      },
      inputFocus(e) {
        this.$emit('focus')
        this.$refs.inputRef.select()
        this.timer && clearTimeout(this.timer)
      },
      inputBlur() {
        this.$emit('blur')
      },
    },
  }
</script>
<style scoped>
  /* @import url(); 引入css类 */
</style>
