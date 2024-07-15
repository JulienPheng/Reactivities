using Application.Interfaces;
using Application.Photos;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Photos {
    public class PhotoAccessor : IPhotoAccessor {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<PhotoAccessor> _logger;
        public PhotoAccessor(IOptions<CloudinarySettings> config, ILogger<PhotoAccessor> logger) {
            var account = new Account (
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
            _logger = logger;
        }

        public async Task<PhotoUploadResult> AddPhoto(IFormFile file) {
            if (file == null || file.Length == 0) {
                _logger.LogError("File is null or empty");
                throw new ArgumentException("File cannot be null or empty", nameof(file));
            }

            _logger.LogInformation("Uploading file: {FileName}", file.FileName);

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Height(500).Width(500).Crop("fill")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null) {
                _logger.LogError("Error uploading file: {Error}", uploadResult.Error.Message);
                throw new Exception(uploadResult.Error.Message);
            }

            _logger.LogInformation("File uploaded successfully: {PublicId}", uploadResult.PublicId);

            return new PhotoUploadResult {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.SecureUrl.ToString()
            };
        }

        public async Task<string> DeletePhoto(string publicId) {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);

            _logger.LogInformation("Delete result: {Result}", result.Result);

            return result.Result == "ok" ? result.Result : null;
        }
    }
}
