export default {
  list: {
    navbar: '成员列表',
    title: '成员列表 · 控制台',
    filter: {
      ALL: '全部 (:count)',
      ADMIN: '管理员 (:count)',
    }
  },
  add: {
    navbar: '添加成员',
    title: '添加成员 · 控制台',
    save: '添加成员',
    username: {
      label: '*用户名',
      placeholder: '用户名（推荐使用员工姓名拼音）',
    },
    email: {
      label: '*邮箱',
      placeholder: '',
    },
    password: {
      label: '*初始密码',
      placeholder: '',
    },
    role: {
      label: '角色',
      placeholder: '选择角色',
    },
    flow: {
      label: 'flow 授权',
      placeholder: '',
    },
    isSendEmail: {
      label: '发送用户通知',
      desc: '向新成员发送有关账户详情的电子邮件',
    },
  },
}
