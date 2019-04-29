<template>
  <div class="app-container">
    <el-form ref="form" :model="uploadObj" label-width="140px" label-position="left" label-suffix="：">
      <el-form-item label="广告模板名称" style="width:50%">
        <el-input v-model="uploadObj.adTemplateName" placeholder="请输入模板名称"></el-input>
      </el-form-item>

      <el-card class="box-card">
        <h4>图片广告</h4>
        <el-form-item label="图片轮播间隔(秒)" style="width:20%">
          <el-input v-model="uploadObj.picShowIntervalTime"></el-input>
        </el-form-item>
        <el-form-item label="上传图片">
          <vue-dropzone ref="picDropZone" id="dropzonePic" :options="picDropzoneOptions" :useCustomSlot=true v-on:vdropzone-success="dropZoneSuccess" v-on:vdropzone-removed-file="dropZoneRemoved">
            <div class="dropzone-custom-content">
              <h3 class="dropzone-custom-title">点击此区域上传，可同时选中多张图片或者拖拽上传，每张图片需小于2M</h3>
            </div>
          </vue-dropzone>
        </el-form-item>
      </el-card>

      <el-card class="box-card">
        <h4>视频广告</h4>
        <el-form-item label="上传视频">
          <el-row>
            <el-col :span="4.5">
              <vue-dropzone ref="addVideoDropZone" id="addVideoDropZoneId" :options="videoDropzoneOptions" :useCustomSlot=true v-on:vdropzone-success="dropZoneVideoSuccess">
                <div class="dropzone-custom-content-2">
                  <h3 class="dropzone-custom-title-2">点击此区域上传视频</h3>
                  <el-button type="primary">添加视频</el-button>
                </div>
              </vue-dropzone>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top:20px;">
            <el-col v-for="item in videoFileObjArr0" :key="item.uploadUUID" :span="6">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>视频名称：{{item.name}}</span>
                </div>
                <div class="component-item">
                  <div><span>文件编号：{{item.uploadUUID}}</span></div>
                  <div><span>文件大小：{{item.size | fileSizeFilter}}</span></div>
                  <el-button type="success" @click="playVideo(item.url)">播放视频</el-button>
                  <el-button type="danger" @click="removeVideo(item.uploadUUID)">删除</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-form-item>
      </el-card>

      <el-form-item label="广告播放顺序">
        <el-select v-model="uploadObj.playOrder" placeholder="请选择">
          <el-option label="顺序播放" value="ordered"></el-option>
          <el-option label="随机播放" value="random"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="是否启用">
        <el-switch
          v-model="uploadObj.isEnabled"
          active-color="#13ce66"
          inactive-color="#ff4949">
        </el-switch>
      </el-form-item>

      <el-form-item>
        <el-button v-if="isJumpFromList" type="warning" @click="updateAdTemplateBtn">立即更新</el-button>
        <el-button v-else type="primary" @click="createAdTemplateBtn">立即创建</el-button>
        <el-button @click="cancelCreate">取消</el-button>
      </el-form-item>
    </el-form>

    <el-dialog title="视频预览" :visible.sync="dialogPlayVideoVisible" width='40%'>
      <d-player :options="dplayerOptions" ref="player"></d-player>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeVideoDialog">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import vueDropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { createAdTemplate, getAdTemplateById, updateAdTemplate } from '@/api/ad'

import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'

export default {
  name: 'CreateAdTemplate',
  components: {
    vueDropzone,
    'd-player': VueDPlayer
  },
  data() {
    return {
      isJumpFromList: false,
      dialogPlayVideoVisible: false,
      picDropzoneOptions: {
        url: 'http://www.g58mall.com/SellRobotSys/uploadfile/uploadOneFile',
        thumbnailWidth: 150,
        maxFiles: 10,
        maxFilesize: 2, // M兆 表示此上传区域总的文件大小 2*maxFiles
        addRemoveLinks: true,
        acceptedFiles: 'image/*',
        dictRemoveFile: '移除文件'
      },
      videoDropzoneOptions: {
        url: 'http://www.g58mall.com/SellRobotSys/uploadfile/uploadOneFile',
        thumbnailWidth: 150,
        maxFiles: 1,
        maxFilesize: 20, // M兆
        addRemoveLinks: true,
        acceptedFiles: 'video/*',
        dictRemoveFile: '移除文件'
      },
      videoFileObjArr0: [],
      uploadObj: {
        id: 0,
        adTemplateName: '', // 广告模板名称
        picShowIntervalTime: 6, // 图片轮播的时间间隔
        playOrder: 'ordered', // 是否随机播放图片和视频文件 'ordered'  'random'
        isEnabled: false, // 是否启用
        picFileObjArr: [], // 存储服务器返回的图片对象oneFileObj
        videoFileObjArr: [] // 存储服务器返回的视频文件oneFileObj
      },
      dplayerOptions: {
        video: {
          url: ''
        },
        autoplay: true,
        loop: false,
        lang: 'zh-cn'
      }
    }
  },
  computed: {
    player() {
      return this.$refs.player.dp
    }
  },
  filters: {
    fileSizeFilter(size) {
      return Math.round(size / 10000.0) / 100.0 + ' M'
    }
  },
  mounted() {
    if (this.$route.query.templateId !== undefined) { // 根据templateId加载属于改groupId的对话
      this.isJumpFromList = true // 设置是从列表页面跳转过来的，创建按钮变成更新
      this.uploadObj.id = this.$route.query.templateId
      getAdTemplateById(this.uploadObj.id).then(response => {
        if (response.data.code === 0) {
          this.uploadObj = response.data.uploadObj
          this.videoFileObjArr0 = response.data.videoFileObjArr
          this.uploadObj.picFileObjArr = response.data.picFileObjArr
          // 将图片文件放入dropzone区域
          for (var i = 0; i < this.uploadObj.picFileObjArr.length; i++) {
            this.$refs.picDropZone.manuallyAddFile(this.uploadObj.picFileObjArr[i], this.uploadObj.picFileObjArr[i].url) // 主动添加一张图片
          }
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    }
  },
  methods: {
    dropZoneSuccess(file, response) {
      var oneFileObj = {
        uploadUUID: '',
        size: 0,
        name: '',
        type: '',
        url: null
      }
      oneFileObj.uploadUUID = file.upload.uuid
      oneFileObj.size = file.upload.total
      oneFileObj.name = file.upload.filename
      oneFileObj.type = file.dataURL.split(';')[0].split(':')[1] // data:image/jpeg;
      oneFileObj.url = response.fileurl
      this.uploadObj.picFileObjArr.push(oneFileObj) // 将上传的图片存储到图片数组中
    },
    dropZoneRemoved(file, error, xhr) {
      var uploadUUID = null
      if (file.upload === undefined) { // 获取被删除的图片uuid
        uploadUUID = file.uploadUUID
      } else {
        uploadUUID = file.upload.uuid
      }
      // 遍历picFileObjArr，删除其中uuid为upload_uuid的对象
      for (var i = 0; i < this.uploadObj.picFileObjArr.length; i++) {
        if (uploadUUID === this.uploadObj.picFileObjArr[i].uploadUUID) {
          this.uploadObj.picFileObjArr.splice(i, 1) // 删除此下标的对象
        }
      }
    },
    dropZoneVideoSuccess(file, response) {
      // console.log('--video file = ' + JSON.stringify(file) + ', response = ' + JSON.stringify(response))
      var oneFileObj = {
        uploadUUID: '',
        size: 0,
        name: '',
        type: '',
        url: null
      }
      oneFileObj.uploadUUID = file.upload.uuid
      oneFileObj.size = file.upload.total
      oneFileObj.name = file.upload.filename
      oneFileObj.type = 'video/mp4'
      oneFileObj.url = response.fileurl
      this.videoFileObjArr0.push(oneFileObj) // 将上传的图片存储到图片数组中
      this.$refs.addVideoDropZone.removeAllFiles()
    },
    createAdTemplateBtn() { // 创建按钮功能
      if (this.uploadObj.adTemplateName.trim().length <= 0) {
        this.$message({
          message: '请输入广告模板名称',
          type: 'warning'
        })
        return
      }
      this.uploadObj.videoFileObjArr = this.videoFileObjArr0
      createAdTemplate(this.uploadObj).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
          this.$router.push({ path: '/adConfiguration/list' }) // 跳转到广告模板列表页面
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    updateAdTemplateBtn() {
      if (this.uploadObj.adTemplateName.trim().length <= 0) {
        this.$message({
          message: '请输入广告模板名称',
          type: 'warning'
        })
        return
      }
      this.uploadObj.videoFileObjArr = this.videoFileObjArr0
      updateAdTemplate(this.uploadObj).then(response => {
        if (response.data.code === 0) {
          this.$message({
            message: response.data.message,
            type: 'success'
          })
          this.$router.push({ path: '/adConfiguration/list' }) // 跳转到广告模板列表页面
        } else {
          this.$message({
            message: response.data.message,
            type: 'error'
          })
        }
      })
    },
    cancelCreate() { // 取消，跳转到广告模板列表页面
      this.$router.push({ path: '/adConfiguration/list' }) // 跳转到广告模板列表页面
    },
    playVideo(url) {
      this.dialogPlayVideoVisible = true
      this.dplayerOptions.video.url = url
      this.player.switchVideo({
        url: url
      })
    },
    removeVideo(uuid) {
      // 遍历picFileObjArr，删除其中uuid为upload_uuid的对象
      for (var i = 0; i < this.videoFileObjArr0.length; i++) {
        if (uuid === this.videoFileObjArr0[i].uploadUUID) {
          this.videoFileObjArr0.splice(i, 1) // 删除此下标的对象，此处绑定的变量不能是uploadObj中的二级变量，要是一个一级变量修改才能动态变化
        }
      }
    },
    closeVideoDialog() {
      // 将视频流设置到开头位置
      this.player.pause()
      this.player.seek(0)
      this.dialogPlayVideoVisible = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dropzone-custom-content {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 50px;
  transform: translate(-50%, -50%);
  text-align: center;
}
.dropzone-custom-content-2 {
  position: relative;
  top: 50%;
  left: 50%;
  height: 50px;
  transform: translate(-50%, -50%);
  text-align: center;
}

.dropzone-custom-title {
  margin-top: 0;
  color: #00b782;
}
.dropzone-custom-title-2 {
  margin-top: 0;
  color: #00b782;
}
.box-card {
  margin-bottom: 20px
}
</style>
