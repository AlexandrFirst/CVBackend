/* eslint-disable */

import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise"

export async function createAssessment({
    projectID, recaptchaKey, token, recaptchaAction, credentialPath
}): Promise<number | null> {
    // Create the reCAPTCHA client.
    // TODO: Cache the client generation code (recommended) or call client.close() before exiting the method.
    const client = new RecaptchaEnterpriseServiceClient({
        keyFile: credentialPath
    });
    const projectPath = client.projectPath(projectID);

    // Build the assessment request.
    const request = ({
        assessment: {
            event: {
                token: token,
                siteKey: recaptchaKey,
            },
        },
        parent: projectPath,
    });

    const [response] = await client.createAssessment(request);
    client.close();

    // Check if the token is valid.
    if (!response.tokenProperties.valid) {
        console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
        return null;
    }

    // Check if the expected action was executed.
    // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
    if (response.tokenProperties.action === recaptchaAction) {
        // Get the risk score and the reason(s).
        // For more information on interpreting the assessment, see:
        // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
        console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
        response.riskAnalysis.reasons.forEach((reason) => {
            console.log(reason);
        });

        return response.riskAnalysis.score;
    } else {
        console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
        return null;
    }
}