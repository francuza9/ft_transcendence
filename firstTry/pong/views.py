from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

def pong(request):
	template = loader.get_template('myfirst.html')
	return	HttpResponse(template.render())

def login_view(request):
    return (render(request, 'login.html'))

def register_view(request):
    return (render(request, 'register.html'))
	# if request.method == 'POST':
        # form = AuthenticationForm(request, data=request.POST)
        # if form.is_valid():
            # username = form.cleaned_data.get('username')
            # password = form.cleaned_data.get('password')
            # user = authenticate(username=username, password=password)
            # if user is not None:
                # login(request, user)
                # return redirect('pong')  # Redirect to the pong view or another path
    # else:
        # form = AuthenticationForm()
    # return render(request, 'login.html', {'form': form})
    