from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('emails/<int:email_id>/', views.email_detail, name='email_detail'),
    path('email_detail/<int:email_id>/', views.email_detail, name='email_detail'),
    path("inbox", views.inbox, name="inbox"),
    path('reply_to_email/<int:email_id>/', views.reply_to_email, name='reply_to_email'),
    
    

    # API Routes
    path('email/<int:email_id>/', views.delete_email, name='delete_email'),
    path("emails", views.compose, name="compose"),
    path("emails/<int:email_id>", views.email, name="email"),
    path("emails/<str:mailbox>", views.mailbox, name="mailbox"),
]
