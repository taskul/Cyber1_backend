// creating a transport
// a transporter is going to allow us to hook up to an SMTP API, what's  called a fake surface or a Mailtrap.
// we won't want to send a real email in development

// nodemailer is a packed that is used to send email in Node.js
import { createTransport, getTestMessageUrl } from 'nodemailer';

const transport = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function makeANiceEmail(text: string) {
  return `
      <div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
      ">
        <h2>Hello There!</h2>
        <p>${text}</p>
  
        <p>Thanks. Tas</p>
      </div>
    `;
}

export interface MailResponse {
  accepted?: string[] | null;
  rejected?: null[] | null;
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: Envelope;
  messageId: string;
}
export interface Envelope {
  from: string;
  to?: string[] | null;
}

// Here we expect a string coming in, and expecting a function to return a promise, which will eventually returin nothing, a void.
export async function sendPasswordResetEmail(
  resetToken: string,
  to: string
): Promise<void> {
  // email the user a token
  const info = (await transport.sendMail({
    to,
    from: 'dudedudov@yahoo.com',
    subject: 'Your password reset token!',
    html: makeANiceEmail(`Your password Reset Token is here!
    
        <a href="${process.env.FRONTEND_URL}/reset?token=${resetToken}">Click Here to Reset Your Password. </a>
    
    `),
  })) as MailRespone;
  if (process.env.MAIL_USER.includes('ethereal.email')) {
    // this will give us link where we can see the test email we sent out
    console.log(`Message sent! Preview it at ${getTestMessageUrl(info)}`);
  }
}
