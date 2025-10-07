import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });

    console.log("Message sent: %s", info.messageId);
};
