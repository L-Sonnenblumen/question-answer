import request from '@/client';

export const studentApi = {
  login: (params) =>
    request({
      url: '/stu_auth/login',
      method: 'post',
      data: params,
    }),
  logout: (student_id) =>
    request({
      url: '/stu_auth/logout',
      method: 'post',
      data: { student_id },
    }),
  profile: (student_id) =>
    request({
      url: '/stu_user/profile',
      method: 'post',
      data: { student_id },
    }),
  quizList: (student_id, status) =>
    request({
      url: '/stu_quiz/list',
      method: 'post',
      data: { student_id, status },
    }),
  quizDetail: (student_id, quiz_id) =>
    request({
      url: '/stu_quiz/detail',
      method: 'post',
      data: { student_id, quiz_id },
    }),
  questionDetail: (student_id, quiz_id, question_id) =>
    request({
      url: '/stu_quiz/question/detail',
      method: 'post',
      data: { student_id, quiz_id, question_id },
    }),
  // 假设这是你 api 对象下的 student 模块
  answer: (
    student_id,
    quiz_id,
    question_id,
    answer_md,
    images, // 🚨 注意：这里把名字从 image_urls 改成了 images（接收 File 对象数组）
    submitted_at,
    duration_sec,
  ) => {
    // 1. 创建 FormData 对象
    const formData = new FormData();

    // 2. 将普通文本字段塞进表单
    if (student_id) formData.append('student_id', student_id);
    if (quiz_id) formData.append('quiz_id', quiz_id);
    if (question_id) formData.append('question_id', question_id);
    if (answer_md) formData.append('answer_md', answer_md);
    if (submitted_at) formData.append('submitted_at', submitted_at);
    if (duration_sec !== undefined)
      formData.append('duration_sec', String(duration_sec));

    // 3. 将图片数组循环塞进表单（注意 key 都是 'images'，支持多图上传）
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // 4. 发送请求
    return request({
      url: '/stu_quiz/answer/submit',
      method: 'post',
      data: formData,
      headers: {
        // 告诉服务器这是一个携带文件的表单请求
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  gradingView: (student_id: string, answer_id: string) => {
    return request({
      url: '/stu_quiz/answer/grading-view',
      method: 'post',
      data: {
        student_id,
        answer_id,
      },
    });
  },
};
