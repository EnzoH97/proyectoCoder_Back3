class EmailService {
    async send(message) {
        console.log(`[EMAIL] ${message}`);
    }
}

export default new EmailService();
