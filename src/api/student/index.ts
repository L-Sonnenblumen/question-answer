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
    image_urls,
    submitted_at,
    duration_sec,
  ) =>
    request({
      url: '/stu_quiz/answer/submit',
      method: 'post',
      data: {
        student_id,
        quiz_id,
        question_id,
        answer_md,
        image_urls,
        submitted_at,
        duration_sec,
      },
    }),
};
