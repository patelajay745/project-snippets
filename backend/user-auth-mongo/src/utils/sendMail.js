import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_TRAP_USERNAME,
    pass: process.env.MAIL_TRAP_PASSWORD,
  },
});

export class MyMail {
  constructor(email) {
    this.email = email;
  }
  async sendEmail(message) {
    const info = await transporter.sendMail({
      from: "patel.ajay745@gmail.com",
      to: this.email,
      subject: "From userAuth App",
      html: `<b>${message}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
  }
}
