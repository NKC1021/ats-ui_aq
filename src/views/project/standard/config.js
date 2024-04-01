import { translate } from '@/i18n'
/*
 * @Author: pengfei.zhang pengfei.zhang@aqrose.com
 * @Date: 2023-05-26 10:25:26
 * @LastEditors: pengfei.zhang pengfei.zhang@aqrose.com
 * @LastEditTime: 2023-09-15 11:33:08
 * @FilePath: \fastlabel-view\src\views\project\standard\config.js
 * @Description: 标准管理的配置项
 */
export const indexCol = {
  title: translate('序号'),
  field: 'seq',
  key: 'seq',
  width: 40,
  align: 'center',
  fixed: 'left',
  unSpan: true,
  operationColumn: true,
  addRenderBodyCell: true,
}

export const opticsCol = {
  key: 'opticsCol',
  addRenderBodyCell: true,
  title: translate('光学方案标准'),
  children: [
    {
      isPrimaryCol: true,
      leafNodeField: 'optics',
      id: 'stationId',
      title: translate('工位'),
      primaryField: 'station',
      field: 'station',
      key: 'station',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('用于工位的唯一标识区分'),
    },
    {
      params: true,
      id: 'stationId',
      title: translate('工位说明'),
      primaryField: 'station',
      field: 'stationDesc',
      key: 'stationDesc',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('备注这个工位的用途等说明'),
    },
    {
      isPrimaryCol: true,
      leafNodeField: 'optics',
      id: 'cameraCodeId',
      groupCriteria: true,
      title: translate('相机编号'),
      primaryField: 'cameraCode',
      field: 'cameraCode',
      key: 'cameraCode',
      width: 100,
      type: 3,
      remark: translate('用于相机的唯一标识区分'),
    },
    {
      params: true,
      id: 'cameraCodeId',
      title: translate('相机信息'),
      primaryField: 'cameraCode',
      key: 'cameraDesc',
      field: 'cameraDesc',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('备注这个相机编号的相关信息'),
    },
    {
      isPrimaryCol: true,
      leafNodeField: 'optics',
      id: 'pointId',
      title: translate('采图点位'),
      groupCriteria: true,
      primaryField: 'point',
      field: 'point',
      key: 'point',
      width: 100,
      type: 3,
      remark: translate('记录相机采图点位，相邻点位会区间合并'),
    },
    {
      params: true,
      id: 'pointId',
      title: translate('点位说明'),
      primaryField: 'point',
      field: 'pointDesc',
      key: 'pointDesc',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('备注这个或多个采图点位的用途等说明'),
    },
    {
      isPrimaryCol: true,
      leafNodeField: 'optics',
      isLeafNode: true,
      id: 'opticsId',
      primaryField: 'optics',
      title: translate('光照ID'),
      field: 'optics',
      key: 'optics',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('用于光照的唯一标识区分'),
    },
    {
      params: true,
      id: 'opticsId',
      title: translate('图片数量'),
      primaryField: 'optics',
      field: 'picNum',
      key: 'picNum',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('备注这个光照ID每组有多少张图片'),
    },
    {
      params: true,
      id: 'opticsId',
      title: translate('光照方式'),
      primaryField: 'optics',
      field: 'opticsType',
      key: 'opticsType',
      width: 80,
      type: 3,
      edit: true,
      remark: translate('备注这个光照ID，现场已实施的光照信息'),
    },
    {
      params: true,
      id: 'opticsId',
      title: translate('光照效果要求'),
      primaryField: 'optics',
      field: 'opticsClaim',
      key: 'opticsClaim',
      width: 110,
      type: 3,
      edit: true,
      remark: translate('备注这个光照ID，光学方案要求的光照信息'),
    },
    {
      isImg: true,
      id: 'opticsId',
      title: translate('光学样图'),
      primaryField: 'optics',
      field: 'opticsPic',
      key: 'opticsPic',
      width: 250,
      type: 3,
      remark: translate('展示这个光照ID，现场已实施的光照样图'),
    },
  ],
}

export const defectCol = {
  key: 'defectCol',
  addRenderBodyCell: true,
  title: translate('客户缺陷标准'),
  children: [
    {
      isPrimaryCol: true,
      leafNodeField: 'customDefect',
      isLeafNode: true,
      id: 'customDefectId',
      primaryField: 'customDefect',
      title: translate('客户缺陷名'),
      field: 'customDefect',
      key: 'customDefect',
      width: 110,
      type: 1,
      edit: true,
      remark: translate(
        '按客户SOP缺陷名命名（数据清洗页面的可打标签来源，根据光学方案层级查询获取此可打标签）'
      ),
    },
    {
      params: true,
      id: 'customDefectId',
      title: translate('缺陷描述'),
      primaryField: 'customDefect',
      field: 'defectDesc',
      key: 'defectDesc',
      width: 110,
      type: 1,
      edit: true,
      remark: translate('描述这个客户缺陷的特征'),
    },
    {
      params: true,
      id: 'customDefectId',
      title: translate('客户标准(可放行与不和放行界线)'),
      primaryField: 'customDefect',
      field: 'customStandard',
      key: 'customStandard',
      width: 250,
      type: 1,
      edit: true,
      remark: translate('备注这个客户缺陷，可放行和不可放行判断标准'),
    },
    {
      isImg: true,
      id: 'customDefectId',
      title: translate('缺陷样图(不可放行)'),
      primaryField: 'customDefect',
      field: 'cUnreleasablePic',
      key: 'cUnreleasablePic',
      width: 250,
      type: 1,
      remark: translate('展示这个客户缺陷，不可放行的样图'),
    },
    {
      isImg: true,
      id: 'customDefectId',
      title: translate('缺陷样图(不确定)'),
      primaryField: 'customDefect',
      key: 'unSurePic',
      field: 'unSurePic',
      width: 250,
      type: 1,
      remark: translate('展示这个客户缺陷，不确定是否放行的样图'),
    },
    {
      isImg: true,
      id: 'customDefectId',
      title: translate('缺陷样图(可放行)'),
      primaryField: 'customDefect',
      key: 'cReleasablePic',
      field: 'cReleasablePic',
      width: 250,
      type: 1,
      remark: translate('展示这个客户缺陷，可放行的样图'),
    },
  ],
}

export const modelCol = {
  key: 'modelCol',
  addRenderBodyCell: true,
  title: translate('AI工程标准'),
  children: [
    {
      isPrimaryCol: true,
      leafNodeField: 'enginDefect',
      primaryField: 'aiEngin',
      id: 'aiEnginId',
      title: translate('AI工程名'),
      field: 'aiEngin',
      key: 'aiEngin',
      width: 80,
      type: 2,
      edit: true,
      remark: translate('用于AI工程的唯一标识区分'),
    },
    {
      params: true,
      primaryField: 'aiEngin',
      id: 'aiEnginId',
      title: translate('图片数量'),
      field: 'enginPicNum',
      key: 'enginPicNum',
      width: 80,
      type: 2,
      edit: true,
      remark: translate('备注这个AI工程的建模图片，是单图还是多图'),
    },
    {
      relateCriteriaId: ['opticsId', 'enginDefectId'],
      params: true,
      id: 'aiEnginId',
      primaryField: 'aiEngin',
      title: translate('ROIs'),
      field: 'ROIs',
      key: 'ROIs',
      width: 80,
      type: 2,
      edit: true,
      remark: translate(
        '备注这个AI工程的图片ROI（center X，centerY，width，height，angle），可填入多组'
      ),
    },
    {
      // params: true,
      isPrimaryCol: true,
      leafNodeField: 'enginDefect',
      isLeafNode: true,
      title: translate('工程缺陷名'),
      id: 'enginDefectId',
      primaryField: 'enginDefect',
      field: 'enginDefect',
      key: 'enginDefect',
      width: 110,
      type: 2,
      edit: true,
      remark: translate(
        '按AI工程建模标注的标签名命名（数据清洗页面的可打标签来源，根据光学方案层级查询获取此可打标签）'
      ),
    },
    {
      params: true,
      title: translate('标注标准'),
      id: 'enginDefectId',
      primaryField: 'enginDefect',
      key: 'labelStandard',
      field: 'labelStandard',
      width: 80,
      type: 2,
      edit: true,
      remark: translate('备注这个工程缺陷，图像标注的标准'),
    },
    {
      isImg: true,
      title: translate('工程样图(不可放行)'),
      id: 'enginDefectId',
      primaryField: 'enginDefect',
      field: 'aiUnReleasablePic',
      key: 'aiUnReleasablePic',
      width: 250,
      type: 2,
      remark: translate(
        '从数据集选图加入SOP，展示这个AI工程-工程缺陷，不可放行的样图'
      ),
    },
    {
      isImg: true,
      title: translate('工程样图(不确定)'),
      id: 'enginDefectId',
      primaryField: 'enginDefect',
      field: 'aiUnSurePic',
      key: 'aiUnSurePic',
      width: 250,
      type: 2,
      remark: translate(
        '从数据集选图加入SOP，展示这个AI工程-工程缺陷，不确定是否放行的样图'
      ),
    },
    {
      isImg: true,
      title: translate('工程样图(可放行)'),
      id: 'enginDefectId',
      primaryField: 'enginDefect',
      key: 'aiReleasablePic',
      field: 'aiReleasablePic',
      width: 250,
      type: 2,
      remark: translate(
        '从数据集选图加入SOP，展示这个AI工程-工程缺陷，可放行的样图'
      ),
    },
  ],
}

export const filedImgMap = {
  customDefect: {
    1: 'cReleasablePic',
    2: 'unSurePic',
    3: 'cUnreleasablePic',
  },
  enginDefect: {
    1: 'aiReleasablePic',
    2: 'aiUnSurePic',
    3: 'aiUnReleasablePic',
  },
  optics: 'opticsPic',
}

export const bodyContextmenus = [
  [
    {
      code: 'ADD_ROW_ABOVE',
      name: translate('向上插入一行'),
    },
    {
      code: 'ADD_ROW_BELOW',
      name: translate('向下插入一行'),
    },
    {
      code: 'DELETE_ROW',
      name: translate('删除'),
    },
  ],
  [
    {
      code: 'MOVE_ABOVE',
      name: translate('上移'),
    },
    {
      code: 'MOVE_BELOW',
      name: translate('下移'),
    },
  ],
]

/**
 * 1.客户缺陷
 * 2.AI工程
 * 3.光学方案
 */
export const selectOptions = [
  {
    id: 1,
    value: [3, 1, 2],
    label: translate('光学方案标准'),
  },
  {
    id: 2,
    value: [1, 3, 2],
    label: translate('客户缺陷标准'),
  },
  {
    id: 3,
    value: [2, 1, 3],
    label: translate('AI工程标准'),
  },
]
