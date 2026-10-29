import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> bool:
    settings = get_settings()
    if settings.email_provider != "smtp" or not settings.smtp_host or not settings.email_from:
        logger.warning("Email delivery is not configured; message was not sent to %s", to)
        return False
    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as connection:
            connection.starttls()
            if settings.smtp_username and settings.smtp_password:
                connection.login(settings.smtp_username, settings.smtp_password)
            connection.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("Email delivery failed for %s", to)
        return False
    return True
