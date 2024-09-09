from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Profile
from PIL import Image

MAX_FILE_SIZE_MB = 2  # Max size in megabytes
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']  # Allowed image formats

@login_required
@csrf_exempt
def update_avatar(request):
	if request.method == 'POST':
		user_profile = Profile.objects.get(user=request.user)

		# Check if the file is uploaded
		if 'avatar' not in request.FILES:
			return JsonResponse({'success': False, 'message': 'No file uploaded.'}, status=400)

		avatar_file = request.FILES['avatar']

		# Check file size (limit is 2MB)
		if avatar_file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
			return JsonResponse({'success': False, 'message': 'File size exceeds 2MB limit.'}, status=400)

		# Check MIME type (format)
		if avatar_file.content_type not in ALLOWED_IMAGE_TYPES:
			return JsonResponse({'success': False, 'message': f'Invalid image format: {avatar_file.content_type}. Allowed formats are JPEG, PNG, GIF.'}, status=400)

		# Verify if it's a valid image using Pillow
		try:
			img = Image.open(avatar_file)
			img.verify()  # Verify the image integrity
		except (IOError, SyntaxError) as e:
			return JsonResponse({'success': False, 'message': 'The uploaded file is not a valid image.'}, status=400)

		# Delete the old avatar if it exists
		if user_profile.avatarUrl:
			user_profile.avatarUrl.delete(save=False)

		# Save the new avatar
		user_profile.avatarUrl.save(avatar_file.name, avatar_file, save=True)

		return JsonResponse({'success': True, 'avatarUrl': user_profile.avatarUrl.url})

	return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)

@csrf_exempt
def remove_avatar(request):
	if request.method == 'POST':
		user_profile = Profile.objects.get(user=request.user)

		if user_profile.avatarUrl:
			user_profile.avatarUrl.delete(save=False)
			user_profile.avatarUrl = None
			user_profile.save()

		return JsonResponse({'success': True, 'avatarUrl': None})

	return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)
