import { Request, Response } from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { User } from "../../Models/UserScema";

export default class AuthController {
    public login(req: Request, res: Response): void {
        res.send("login");
    }

    public async register(req: Request, res: Response): Promise<void> {
        const { firstName, lastName, email } = req.body;
        if (!firstName || !lastName || !email) {
            res.status(400).json({ message: "Missing required fields" });

            return;
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password: null,
        });

        await user
            .save()
            .then((user) => {
                res.status(201).json({
                    message: "User created successfully! Check email!",
                });
                this.sendEmail(email, user._id.toString());
            })
            .catch(() => {
                res.status(500).json({
                    message: "An error occurred during registration",
                });
            });
    }

    private async sendEmail(email: string, id: string): Promise<void> {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        const info = await transporter.sendMail({
            from: "book@app.com",
            to: email,
            subject: "Set new password",
            text: `Click this link and set new password: /api/set-new-password/${id}`,
        });
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    public async setNewPassword(req: Request, res: Response): Promise<void> {
        const userId: string = req.params.id;
        const { password, repeatPassword } = req.body;

        const user = await User.findOne({ _id: userId });

        if (!user) {
            res.status(404).json({ message: "User not found" });

            return;
        }

        if (password !== repeatPassword) {
            res.status(400).json({ message: "Passwords do not match" });

            return;
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save()
            .then(() => {
                res.status(200).json(
                    {
                        message: "Password updated successfully",
                        user: user
                    }
                );
            });
    }

    public async forgotPassword(req: Request, res: Response): Promise<void> {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "User not found" });

            return;
        } else {
            res.status(200).json({ message: "Check email and set new password" });
            await this.sendEmail(email, user._id.toString());
        }
    }

    public logout(req: Request, res: Response): void {
        res.send("logout");
    }
}
