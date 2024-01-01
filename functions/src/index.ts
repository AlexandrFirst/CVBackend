/* eslint-disable */

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { SendMailRequest, SendMailResponse } from "./iEmail";
import { createAssessment } from "./captchaVerification";
import * as sgMail from "@sendgrid/mail"

setGlobalOptions({ maxInstances: 10 });

//to deploy function run firebase deploy --only functions

export const sendMail = onRequest({ cors: true },
  async (request, response) => {

    const mailBody = request.body as SendMailRequest;
    
    const assessmentReult = await createAssessment({
      projectID: process.env.GOOGLE_PROJECT_ID,
      recaptchaAction: process.env.SEND_EMAIL_API_ACTION,
      recaptchaKey: process.env.RECAPTCHA_KEY,
      token: mailBody.captchaToken,
      credentialPath: process.env.GOOFLE_CREDENTIALS
    })

    if (!assessmentReult) {
      response.status(400).send(JSON.stringify({
        responseCode: 409,
        responseMessage: "Failed suring assessment"
      } as SendMailResponse));
    }

    if(assessmentReult < 0.7){
      response.status(400).send(JSON.stringify({
        responseCode: 416,
        responseMessage: "Not a human"
      } as SendMailResponse));
    }
   
    try {
      sgMail.setApiKey(process.env.SENDGRID_KEY as string)

      const sendResult = await sgMail.send({
        from: "oleksandr.lohvinov@nure.ua",
        to: "oleksandr.lohvinov@yahoo.com",
        subject: mailBody.messageSubject,
        text: `${mailBody.senderEmail} > ${mailBody.messageContent}`
      })

      response.status(200).send(JSON.stringify({
        responseCode: 200,
        responseMessage: "Send"
      } as SendMailResponse));
      console.log(sendResult);

    } catch (err) {
      console.log(err);

      response.status(400).send(JSON.stringify({
        responseCode: 400,
        responseMessage: err
      } as SendMailResponse));
    }
  });
