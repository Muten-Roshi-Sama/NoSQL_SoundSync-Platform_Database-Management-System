from django.shortcuts import render, redirect
from Users.models import User  # Django User
from django.contrib import messages

def user_list(request):
    # si aucun user n'existe, on en crée un par défaut
    if not User.objects.first():
        User.create_user(
            email="admin@example.com",
            username="admin",
            first_name="Admin",
            last_name="Root",
            password="admin123",
            is_staff=True,
            is_superuser=True
        )

    users = User.objects.all()
    return render(request, "core/user_list.html", {"users": users})


def add_user(request):
    if request.method == "POST":
        email = request.POST.get("email")
        username = request.POST.get("username")
        password = request.POST.get("password")

        if not (email and username and password):
            messages.error(request, "Tous les champs doivent être remplis.")
            return render(request, "Users/add_user.html")

        # Crée l’utilisateur avec Django
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.save()

        messages.success(request, f"L’utilisateur {username} a été créé.")
        return redirect("users:user_list")  # voir remarque ci-dessous

    return render(request, "users/add_user.html")
