from django.core.mail import EmailMessage
import environ

env = environ.Env()
environ.Env.read_env()

class Util:
    @staticmethod
    def send_mail(data):
        email = EmailMessage(
            subject=data['subject'],
            body=data['body'],
            from_email=env('EMAIL_FROM'),
            to=[data['to_email']]
        )

        email.send()
