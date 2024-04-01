<template>
  <div></div>
</template>
<script>
  import plupload from 'plupload/js/plupload.full.min.js'
  // import { getStore } from '../pcbWebCommon/utils/storage.js';
  import { getStore } from '@/utils/storage'
  // import store from '@/store'
  import { getToken } from '@/utils/token'
  export default {
    name: 'Uploader',
    props: {
      browse_button: {
        type: String,
      },
      container: {
        type: String,
      },
      url: {
        type: String,
      },
      filters: {
        type: Object,
      },
      headers: {
        type: Object,
        default() {
          return {
            'X-Token': `${getToken()}`,
            projectId: getStore({ name: 'projectId' }),
            solutionId: getStore({ name: 'solutionId' }),
          }
        },
      },
      multipart_params: {
        type: Object,
      },
      resize: {
        type: Object,
      },
      drop_element: {
        type: String,
      },
      required_features: {
        type: String,
      },
      runtimes: {
        type: String,
        default() {
          return 'html5,flash,silverlight,html4'
        },
      },
      chunk_size: {
        type: String,
        default() {
          return '0'
        },
      },
      multipart: {
        type: Boolean,
        default() {
          return true
        },
      },
      max_retries: {
        type: Number,
        default() {
          return 2
        },
      },
      multi_selection: {
        type: Boolean,
        default() {
          return true
        },
      },
      unique_names: {
        type: Boolean,
        default() {
          return false
        },
      },
      file_data_name: {
        type: String,
        default() {
          return 'file'
        },
      },
      flash_swf_url: {
        type: String,
        default() {
          return 'plupload/js/Moxie.swf'
        },
      },
      silverlight_xap_url: {
        type: String,
        default() {
          return 'plupload/js/Moxie.xap'
        },
      },
      Init: {
        type: Function,
      },
      PostInit: {
        type: Function,
      },
      Browse: {
        type: Function,
      },
      OptionChanged: {
        type: Function,
      },
      Refresh: {
        type: Function,
      },
      StateChanged: {
        type: Function,
      },
      UploadFile: {
        type: Function,
      },
      beforeUpload: {
        type: Function,
      },
      QueueChanged: {
        type: Function,
      },
      UploadProgress: {
        type: Function,
      },
      FilesRemoved: {
        type: Function,
      },
      FileFiltered: {
        type: Function,
      },
      filesAdded: {
        type: Function,
      },
      FileUploaded: {
        type: Function,
      },
      ChunkUploaded: {
        type: Function,
      },
      UploadComplete: {
        type: Function,
      },
      Error: {
        type: Function,
      },
      Destroy: {
        type: Function,
      },
    },
    emits: ['inputUploader', 'filesAdded'],
    data() {
      return {
        up: {},
      }
    },
    computed: {},
    watch: {
      up(val) {
        this.$emit('inputUploader', val)
      },
    },
    mounted() {
      this.init()
    },
    methods: {
      init() {
        const that = this
        const preInitMethod = {
          Init(up, info) {
            if (that.Init) {
              that.Init(up, info)
            }
          },
          UploadFile(up, file) {
            if (that.UploadFile) {
              that.UploadFile(up, file)
            }
          },
        }
        const initMethod = {
          PostInit() {
            if (that.PostInit) {
              that.PostInit()
            }
          },
          Browse(up) {
            if (that.Browse) {
              that.Browse(up)
            }
          },
          OptionChanged(up, name, value, oldValue) {
            if (that.OptionChanged) {
              that.OptionChanged(up, name, value, oldValue)
            }
          },
          Refresh(up) {
            if (that.Refresh) {
              that.Refresh(up)
            }
          },
          StateChanged(up) {
            if (that.StateChanged) {
              that.StateChanged(up)
            }
          },
          BeforeUpload(up, file) {
            // console.log('BeforeUpload::::', file)
            if (that.beforeUpload) {
              that.beforeUpload(up, file)
            }
          },
          QueueChanged(up) {
            if (that.QueueChanged) {
              that.QueueChanged(up)
            }
          },
          UploadProgress(up, file) {
            if (that.UploadProgress) {
              that.UploadProgress(up, file)
            }
          },
          FilesRemoved(up, files) {
            if (that.FilesRemoved) {
              that.FilesRemoved(up, files)
            }
          },
          FileFiltered(up, file) {
            if (that.FileFiltered) {
              that.FileFiltered(up, file)
            }
          },
          FilesAdded(up, files) {
            // console.log('files:::::this:', this)
            // console.log('files:::::that:', that)
            // console.log('files:::::', files)
            // that.$emit('filesAdded', up, files)
            if (that.filesAdded) {
              that.filesAdded(up, files)
            }
          },
          FileUploaded(up, file, info) {
            if (that.FileUploaded) {
              that.FileUploaded(up, file, info)
            }
          },
          ChunkUploaded(up, file, info) {
            if (that.ChunkUploaded) {
              that.ChunkUploaded(up, file, info)
            }
          },
          UploadComplete(up, files) {
            if (that.UploadComplete) {
              that.UploadComplete(up, files)
            }
          },
          Error(up, args) {
            if (that.Error) {
              that.Error(up, args)
            }
          },
          Destroy(up) {
            if (that.Destroy) {
              that.Destroy(up)
            }
          },
        }
        const prop = {
          runtimes: this.runtimes,
          browse_button: this.browse_button,
          container: this.container,
          url: this.url,
          chunk_size: this.chunk_size,
          headers: this.headers,
          multipart: this.multipart,
          max_retries: this.max_retries,
          multi_selection: this.multi_selection,
          unique_names: this.unique_names,
          file_data_name: this.file_data_name,
          flash_swf_url: this.flash_swf_url,
          silverlight_xap_url: this.silverlight_xap_url,
          preinit: preInitMethod,
          init: initMethod,
        }
        if (this.filters) {
          prop['filters'] = this.filters
        }
        if (this.multipart_params) {
          prop['multipart_params'] = this.multipart_params
        }
        if (this.resize) {
          prop['resize'] = this.resize
        }
        if (this.drop_element) {
          prop['drop_element'] = this.drop_element
        }
        if (this.required_features) {
          prop['required_features'] = this.required_features
        }
        const uploader = new plupload.Uploader(prop)
        uploader.init()
        this.up = uploader
      },
    },
  }
</script>
