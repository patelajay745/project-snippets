import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export class MailTrap {
  constructor(email) {
    this.email = email;
  }

  async sendMail(message) {
    await transport.sendMail({
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello from User Auth App", // Subject line
      html: `<b>${message}</b>`, // html body
    });
  }
}
