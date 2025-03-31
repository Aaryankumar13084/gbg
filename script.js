    const fileInput = document.getElementById('fileInput');
    const canvas = new fabric.Canvas('previewCanvas');
    let backgroundImage = null;
    let cropRect = null;
    

    // Image upload handler
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.src = event.target.result;
          img.onload = function() {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const fabricImage = new fabric.Image(img, {
              scaleX: scale,
              scaleY: scale,
              left: (canvas.width - img.width * scale) / 2,
              top: (canvas.height - img.height * scale) / 2,
            });
            canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));
            backgroundImage = fabricImage;
          };
        };
        reader.readAsDataURL(file);
      }
    });

    // Remove background using Remove.bg API
    const apiKeys = ['2QgVyUN1yz1FZoRyJProt7BD', 'BpLHKTp7DAAigoqYXcgMjCoQ', 'm3dVX5KBZvDqdAQzyA3YzJAP','U8G535qFDU9vLM5tCYrd3yoH','Ai9bAcbZKYeBwj44TnpkMdxA']; // 🔥 अपनी API Keys यहां डालो
let currentApiIndex = 0; // 🚀 ट्रैक करेगा कि कौन सी API चल रही है

async function removeBackground() {
    if (currentApiIndex >= apiKeys.length) {
        alert('सभी API Keys की लिमिट खत्म हो गई!');
        return;
    }

    const apiKey = apiKeys[currentApiIndex]; // ⬅️ Current API Key
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload an image first.');
        return;
    }

    const formData = new FormData();
    formData.append('image_file', file);

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API Key ${apiKey} Failed: ${response.statusText}`);
        }

        const result = await response.blob();
        const url = URL.createObjectURL(result);
        const img = new Image();
        img.src = url;
        img.onload = function () {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const fabricImage = new fabric.Image(img, {
                scaleX: scale,
                scaleY: scale,
                left: (canvas.width - img.width * scale) / 2,
                top: (canvas.height - img.height * scale) / 2,
            });
            canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
            canvas.add(fabricImage);
            backgroundImage = fabricImage;
        };
    } catch (error) {
        console.warn(error.message);
        currentApiIndex++; // 🔥 अगली API Key पर स्विच करो
        removeBackground(); // 🚀 दुबारा ट्राई करो
    }
}

    // Custom Background Uplo


    // Custom Background Upload Handler
    document.getElementById('bgFileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.src = event.target.result;
          img.onload = function() {
            const fabricImage = new fabric.Image(img, {
              scaleX: canvas.width / img.width,
              scaleY: canvas.height / img.height,
              left: 0,
              top: 0,
              selectable: false, // User cannot move this
            });
            canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));
          };
        };
        reader.readAsDataURL(file);
      }
    });

        // Change background color
        function changeBgColor(color) {
            canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
        }

        // Rotate image
        function rotateImage() {
            if (backgroundImage) {
                backgroundImage.rotate(backgroundImage.angle + 90);
                canvas.renderAll();
            }
        }

// Enable crop mode (फोटो गैलरी की तरह)
function enableCrop() {
    if (!backgroundImage) {
        alert('कृपया पहले एक फोटो अपलोड करें।');
        return;
    }

    // Remove existing crop rectangle
    if (cropRect) {
        canvas.remove(cropRect);
    }

    // Create a crop rectangle with handles (फोटो गैलरी की तरह)
    cropRect = new fabric.Rect({
        width: 200,
        height: 200,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#2ecc71',
        strokeWidth: 2,
        hasControls: true, // हैंडल्स दिखाएं
        hasBorders: true,  // बॉर्डर दिखाएं
        lockRotation: true, // रोटेशन लॉक करें
        cornerSize: 20,     // कॉर्नर हैंडल का साइज़
        transparentCorners: false, // कॉर्नर दिखाएं
        cornerColor: '#2ecc71',    // कॉर्नर का रंग
        borderColor: '#2ecc71',    // बॉर्डर का रंग
        originX: 'center',  // केंद्र से स्केलिंग
        originY: 'center',  // केंद्र से स्केलिंग
        left: canvas.getWidth() / 2,  // कैनवास के बीच में
        top: canvas.getHeight() / 2   // कैनवास के बीच में
    });

    // रीसाइज़िंग के दौरान पोजीशन को अपडेट करें
    cropRect.on('scaling', function() {
        this.setCoords(); // पोजीशन को अपडेट करें
    });

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
}

// Apply crop (सुधारा हुआ)
function applyCrop() {
    if (!cropRect || !backgroundImage) {
        alert('कृपया पहले क्रॉप एरिया सेलेक्ट करें।');
        return;
    }

    // स्केल्ड डायमेंशन प्राप्त करें
    const actualWidth = cropRect.getScaledWidth();
    const actualHeight = cropRect.getScaledHeight();

    // इमेज की मूल स्थिति और स्केल
    const img = backgroundImage.getElement();
    const imgScaleX = backgroundImage.scaleX;
    const imgScaleY = backgroundImage.scaleY;
    const imgLeft = backgroundImage.left;
    const imgTop = backgroundImage.top;

    // सोर्स कोऑर्डिनेट्स कैलकुलेट करें
    const sourceX = (cropRect.left - imgLeft - actualWidth / 2) / imgScaleX;
    const sourceY = (cropRect.top - imgTop - actualHeight / 2) / imgScaleY;
    const sourceWidth = actualWidth / imgScaleX;
    const sourceHeight = actualHeight / imgScaleY;

    // टेम्प कैनवास तैयार करें
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = actualWidth;
    tempCanvas.height = actualHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // क्रॉप एरिया ड्रॉ करें (सीमा चेक के साथ)
    tempCtx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(img.width - sourceX, sourceWidth),
        Math.min(img.height - sourceY, sourceHeight),
        0,
        0,
        actualWidth,
        actualHeight
    );

    // नई इमेज सेट करें
    const croppedImg = new Image();
    croppedImg.src = tempCanvas.toDataURL();
    croppedImg.onload = function() {
        const scale = Math.min(
            canvas.width / croppedImg.width,
            canvas.height / croppedImg.height
        );
        const fabricImage = new fabric.Image(croppedImg, {
            scaleX: scale,
            scaleY: scale,
            left: (canvas.width - croppedImg.width * scale) / 2,
            top: (canvas.height - croppedImg.height * scale) / 2
        });
        canvas.add(fabricImage); 
        backgroundImage = fabricImage;
        canvas.remove(cropRect);
        cropRect = null;
    };
}
        // Apply filters
        function applyFilter(filter) {
            if (backgroundImage) {
                backgroundImage.filters = [];
                switch (filter) {
                    case 'grayscale':
                        backgroundImage.filters.push(new fabric.Image.filters.Grayscale());
                        break;
                    case 'sepia':
                        backgroundImage.filters.push(new fabric.Image.filters.Sepia());
                        break;
                    case 'blur(5px)':
                        backgroundImage.filters.push(new fabric.Image.filters.Blur({ blur: 5 }));
                        break;
                }
                backgroundImage.applyFilters();
                canvas.renderAll();
            }
        }

        // Add text
        function addText() {
            const text = document.getElementById('textInput').value;
            if (text) {
                const fabricText = new fabric.Text(text, {
                    left: 50,
                    top: 100,
                    fontSize: 20,
                    fill: 'white'
                });
                canvas.add(fabricText);
                canvas.renderAll();
            }
        }

        // Add sticker
        function addSticker(sticker) {
            const fabricText = new fabric.Text(sticker, {
                left: 50,
                top: 100,
                fontSize: 40,
                fill: 'white'
            });
            canvas.add(fabricText);
            canvas.renderAll();
        }

        // Download image
        function downloadImage() {
  // कैनवास को HD क्वालिटी में एक्सपोर्ट करें
  const dataURL = canvas.toDataURL({
    format: 'png', // फॉर्मेट (png, jpeg, आदि)
    quality: 1, // क्वालिटी (0 से 1 के बीच, 1 सबसे बेहतर)
    multiplier: 2, // रेसोल्यूशन को 2x करें (HD क्वालिटी)
  });

  // डाउनलोड लिंक बनाएं
  const link = document.createElement('a');
  link.download = 'edited-image.png'; // फाइल का नाम
  link.href = dataURL; // डेटा URL
  link.click(); // डाउनलोड शुरू करें
}
