/* eslint-disable */

export interface SendMailRequest {
  captchaToken: Required<string>,
  senderName: Required<string>,
  senderEmail: Required<string>,
  messageSubject: Required<string>,
  messageContent: Required<string>
}

export interface SendMailResponse {
  responseCode: number,
  responseMessage: string
}