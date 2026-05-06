import smtplib
from email.mime.text import MIMEText

EMAIL = "sdevadigashreya@gmail.com"
PASSWORD = "wplj xakn sgck mkjt"

def send_email(to_email, subject, message):
    msg = MIMEText(message)
    msg["From"] = EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(EMAIL, PASSWORD)
    server.send_message(msg)
    server.quit()
