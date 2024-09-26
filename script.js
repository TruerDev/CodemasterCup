// Получаем необходимые элементы DOM
const uploadBox = document.getElementById('uploadBox');  // Контейнер для загрузки файла
const fileInput = document.getElementById('fileInput');  // Поле для выбора файла
const errorContainer = document.getElementById('errorContainer');  // Контейнер для сообщений об ошибке
const errorMessage = document.getElementById('errorMessage');  // Поле для отображения сообщения об ошибке
const fileNameDisplay = document.getElementById('fileName');  // Для отображения имени файла с ошибкой
const tryAgainButton = document.getElementById('tryAgainButton');  // Кнопка "Попробовать снова"
const previewImage = document.getElementById('previewImage');  // Изображение предпросмотра
const previewImg = document.getElementById('previewImg');  // Контейнер для предпросмотра изображения
const imageName = document.getElementById('imageName');  // Название изображения
const editWindow = document.getElementById('editWindow');  // Окно редактирования изображения
const startEditingButton = document.getElementById('startEditingButton');  // Кнопка начала редактирования
const closeEditButton = document.getElementById('closeEditButton');  // Кнопка закрытия окна редактирования
const inspectorContent = document.getElementById('inspectorContent');  // Контейнер для параметров в инспекторе
const elementsButton = document.getElementById('elementsButton');  // Кнопка для выбора элементов
const elementsDropdown = document.getElementById('elementsDropdown');  // Выпадающий список элементов
const editableImage = document.getElementById('editableImage');  // Изображение, которое можно редактировать
const saveImageButton = document.getElementById('saveButton');  // Кнопка для сохранения изображения

// Параметры файла
const MAX_SIZE_MB = 5;  // Максимальный размер файла
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;  // Размер в байтах
const VALID_TYPES = ['image/jpeg', 'image/png'];  // Допустимые типы файлов

// Переменные для фильтров и манипуляций с изображением
let globalImageSrc = '';  // Сохранение оригинального пути изображения
let brightness = 100;
let contrast = 100;
let saturation = 100;
let grayscale = 0;
let sepia = 0;
let temperature = 5500;
let hue_rotation = 0;

let originalImageSrc = '';  // Оригинальная версия изображения

// Переменные для поворота и отражений
let rotateAngle = 0, flipHorizontal = 1, flipVertical = 1;
let imageType = "";

// Открытие окна выбора файла при клике на область загрузки
uploadBox.addEventListener('click', () => fileInput.click());

// Обработчик выбора файла
fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));

// Замена изображения по кнопке
document.getElementById('replaceImageButton').addEventListener('click', () => {
    fileInput.click();
});

// Удаление изображения и возврат к области загрузки
document.getElementById('deleteImageButton').addEventListener('click', () => {
    previewImg.classList.add('hidden');
    previewImg.classList.add('display-none');
    uploadBox.classList.remove('hidden');
    uploadBox.classList.remove('display-none');
    previewImage.src = '';  // Очищаем путь к изображению
    fileInput.value = '';  // Очищаем поле выбора файла
});

// Показ или скрытие выпадающего меню элементов
elementsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const buttonRect = elementsButton.getBoundingClientRect();
    
    elementsDropdown.style.top = `${buttonRect.bottom + window.scrollY}px`; 
    elementsDropdown.style.left = `${buttonRect.left + window.scrollX}px`;

    elementsDropdown.classList.toggle('hidden');
    elementsDropdown.classList.toggle('visible');
});

// Закрытие меню элементов при клике вне него
document.addEventListener('click', (event) => {
    if (!elementsButton.contains(event.target) && !elementsDropdown.contains(event.target)) {
        elementsDropdown.classList.remove('visible');
        elementsDropdown.classList.add('hidden');
    }
});

// Обработчики для каждой кнопки элемента в выпадающем списке
const elementButtons = document.querySelectorAll('.dropdown-button');
elementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const toolName = button.querySelector('span').textContent;  // Получаем название инструмента
        console.log(`Вы выбрали инструмент: ${toolName}`);  // Логируем выбор
    });
});

// Показ окна редактирования
startEditingButton.addEventListener('click', () => {
    editWindow.classList.remove('hidden');
    editWindow.classList.add('visible');
});

// Закрытие окна редактирования
closeEditButton.addEventListener('click', () => {
    editWindow.classList.remove('visible');
    editWindow.classList.add('hidden');
});

// Обработка события перетаскивания файла для загрузки
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', handleDrop);
tryAgainButton.addEventListener('click', resetUpload);

// Сохранение отредактированного изображения
const saveImage = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = editableImage.naturalWidth;  // Устанавливаем размер холста как у изображения
    canvas.height = editableImage.naturalHeight;
    
    // Применение фильтров и поворотов
    context.filter = `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hue_rotation}deg)`;
    context.translate(canvas.width / 2, canvas.height / 2);
    if(rotateAngle !== 0) context.rotate(rotateAngle * Math.PI / 180);  // Применяем поворот, если он есть
    context.scale(flipHorizontal, flipVertical);  // Применяем отражение
    context.drawImage(editableImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    // Создаем ссылку для скачивания изображения
    const link = document.createElement("a");
    link.download = "edited image" + imageType;
    link.href = canvas.toDataURL();
    link.click();
}
saveImageButton.addEventListener('click', saveImage);

// Функция для сброса загрузки
function resetUpload() {
    fadeOut(errorContainer, () => {
        fadeIn(uploadBox);
        hideLoader(); 
    });
    fileInput.value = '';  // Очищаем поле загрузки
}

// Функции для плавного появления/исчезновения элементов
function fadeOut(element, callback) {
    element.classList.add('hidden');
    setTimeout(() => {
        element.classList.add('display-none');
        if (callback) callback();  // Если есть коллбэк, вызываем его
    }, 500);
}

function fadeIn(element, callback) {
    element.classList.remove('display-none');
    setTimeout(() => {
        element.classList.remove('hidden');
        if (callback) callback();  // Если есть коллбэк, вызываем его
    }, 10);
}

// Показываем индикатор загрузки
function showLoader(fileName) {
    document.getElementById('loaderText').textContent = `File name ${fileName} is loading`;  // Пишем название файла в лоадере
    fadeIn(document.getElementById('loader'));
}

// Скрываем индикатор загрузки
function hideLoader() {
    fadeOut(document.getElementById('loader'));
}

// Обработка файла
function handleFile(file) {
    if (!file) return;

    // Проверка типа и размера файла
    if (!VALID_TYPES.includes(file.type)) {
        showError('Invalid file type. Please upload JPEG or PNG.', file.name);
    } else if (file.size > MAX_SIZE_BYTES) {
        showError(`File size exceeds ${MAX_SIZE_MB}MB limit.`, file.name);
    } else {
        showLoader(file.name);
        imageType = file.type;
        imageType = (imageType === "image/png") ? ".png" : ".jpg";  // Устанавливаем тип изображения
        
        const imageSrc = URL.createObjectURL(file);  // Создаем URL для изображения
        globalImageSrc = imageSrc;
        originalImageSrc = imageSrc;

        // Устанавливаем источник изображения для предпросмотра и редактирования
        previewImage.src = URL.createObjectURL(file);
        editableImage.src = URL.createObjectURL(file);
        previewImage.onload = () => {
            URL.revokeObjectURL(previewImage.src);  // Освобождаем память от временного URL
            URL.revokeObjectURL(editableImage.src);

            // Плавный переход от области загрузки к предпросмотру
            setTimeout(() => {
                fadeOut(uploadBox, () => {
                    fadeIn(previewImg);
                    hideLoader();
                });
            }, 600);
            URL.revokeObjectURL(imageSrc.src);
        };
    }
}

// Функция для показа ошибки
function showError(message, fileName) {
    errorMessage.textContent = message;  // Устанавливаем текст ошибки
    fileNameDisplay.textContent = `File: ${fileName}`;

    fadeOut(previewImg, () => {
        fadeIn(errorContainer);
        hideLoader();
    });

    fadeOut(uploadBox, () => {
        fadeIn(errorContainer);
        hideLoader();
    });
}

// Событие "dragover" для загрузки файла
function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('dragover');
}

// Обработка сброса файла
function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = event.dataTransfer.files[0];  // Получаем первый файл
    handleFile(file);
}


// Добавляем обработчики для кнопок инструментов (обрезка, изменение размера, поворот и т.д.)
document.getElementById('cropButton').addEventListener('click', showCropParams);  // Кнопка обрезки
document.getElementById('resizeButton').addEventListener('click', showResizeParams);  // Кнопка изменения размера
document.getElementById('RotateFlipButton').addEventListener('click', showRotateFlipParams);  // Кнопка поворота/отражения
document.getElementById('adjustButton').addEventListener('click', showAdjustParams);  // Кнопка настройки (яркость, контраст)
document.getElementById('filtersButton').addEventListener('click', showFiltersParams);  // Кнопка фильтров

let cropRatio = '1:1';  // Соотношение сторон для обрезки по умолчанию

// Показ параметров обрезки
function showCropParams() {
    inspectorContent.innerHTML = `
        <div class="tool-params crop-params">
            <label for="cropRatio">Crop ratio</label>
            <select id="cropRatio">
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
            </select>
        </div>
    `;

    // Изменение соотношения сторон для обрезки
    document.getElementById('cropRatio').addEventListener('change', (event) => {
        cropRatio = event.target.value;
        cropImage();
    });
}

// Функция для обрезки изображения
function cropImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = editableImage;  // Используем редактируемое изображение

    const [ratioWidth, ratioHeight] = cropRatio.split(':').map(Number);  // Получаем ширину и высоту соотношения сторон

    const imageAspectRatio = image.naturalWidth / image.naturalHeight;
    let cropWidth, cropHeight;

    // Рассчитываем обрезку в зависимости от соотношения сторон
    if (imageAspectRatio > ratioWidth / ratioHeight) {
        cropHeight = image.naturalHeight;
        cropWidth = cropHeight * (ratioWidth / ratioHeight);
    } else {
        cropWidth = image.naturalWidth;
        cropHeight = cropWidth / (ratioWidth / ratioHeight);
    }

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Обрезаем изображение и рисуем его на холсте
    context.drawImage(
        image,
        (image.naturalWidth - cropWidth) / 2,
        (image.naturalHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );

    editableImage.src = canvas.toDataURL();  // Обновляем путь к изображению после обрезки
}

// Показ параметров изменения размера
function showResizeParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params resize-params">
        <label for="widthInput">Width (px)</label>
        <input type="text" id="widthInput">
        
        <label for="heightInput">Height (px)</label>
        <input type="text" id="heightInput">

        <label for="constrainProportions">
            <input type="checkbox" id="constrainProportions"> Constrain proportions
        </label>
    </div>
    `;

    // Элементы управления для изменения размера
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const constrainProportionsCheckbox = document.getElementById('constrainProportions');

    const maxWidth = editableImage.naturalWidth;
    const maxHeight = editableImage.naturalHeight;
    widthInput.value = maxWidth;
    heightInput.value = maxHeight;

    const aspectRatio = maxWidth / maxHeight;  // Сохраняем пропорции

    widthInput.setAttribute('max', maxWidth);
    heightInput.setAttribute('max', maxHeight);

    // Обновляем размер изображения
    widthInput.addEventListener('input', () => {
        if (parseInt(widthInput.value, 10) > maxWidth) {
            widthInput.value = maxWidth;
        }

        // Сохраняем пропорции, если выбрано
        if (constrainProportionsCheckbox.checked) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
        resizeImage();
    });

    heightInput.addEventListener('input', () => {
        if (parseInt(heightInput.value, 10) > maxHeight) {
            heightInput.value = maxHeight;
        }

        if (constrainProportionsCheckbox.checked) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
        resizeImage();
    });

    constrainProportionsCheckbox.addEventListener('change', () => {
        if (constrainProportionsCheckbox.checked) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
    });

    // Функция для изменения размера изображения
    function resizeImage() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = widthInput.value;
        canvas.height = heightInput.value;

        context.drawImage(editableImage, 0, 0, canvas.width, canvas.height);

        editableImage.src = canvas.toDataURL();  // Обновляем изображение с новым размером
    }
}

// Показ параметров поворота и отражения
function showRotateFlipParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params rotate-flip-params">
        <!-- Кнопки для поворота на 90° -->
        <label>Rotate (90°)</label>
        <div class="button-group">
            <button id="rotateLeftButton">
                <img src="icons/rotate-left.png" alt="Rotate Left">
            </button>
            <button id="rotateRightButton">
                <img src="icons/rotate-right.png" alt="Rotate Right">
            </button>
        </div>

        <!-- Кнопки для поворота на 45° -->
        <label>Rotate (45°)</label>
        <div class="button-group">
            <button id="rotateLeft45Button">
                <img src="icons/rotate-left.png" alt="Rotate Left 45">
            </button>
            <button id="rotateRight45Button">
                <img src="icons/rotate-right.png" alt="Rotate Right 45">
            </button>
        </div>

        <!-- Пользовательский поворот -->
        <label>Rotate (Custom from -360 to 360°)</label>
        <div class="custom-rotate-group">
            <input type="number" id="customRotate" value="0" step="5" min="-360" max="360">
            <button id="applyCustomRotate">
                <img src="icons/rotate-custom.png" alt="Rotate Custom">
            </button>
        </div>

        <!-- Кнопки для отражений -->
        <label>Flip</label>
        <div class="button-group">
            <button id="flipHorizontalButton">
                <img src="icons/flip-horizontal.png" alt="Flip Horizontal">
            </button>
            <button id="flipVerticalButton">
                <img src="icons/flip-vertical.png" alt="Flip Vertical">
            </button>
        </div>
    </div>
    `;

    // Обработчики для всех кнопок поворота и отражений
    const rotateFlipButtons = document.querySelectorAll('.rotate-flip-params button');
    
    rotateFlipButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Логика для различных кнопок поворота и отражения
            if(button.id === "rotateLeftButton") {
                rotateAngle -= 90;
            } else if(button.id === "rotateRightButton") {
                rotateAngle += 90;
            } else if(button.id === "rotateLeft45Button") {
                rotateAngle -= 45;
            } else if(button.id === "rotateRight45Button") {
                rotateAngle += 45;
            } else if(button.id === "flipHorizontalButton") {
                flipHorizontal = flipHorizontal === 1 ? -1 : 1;  // Меняем направление отражения
            } else if(button.id === "flipVerticalButton") {
                flipVertical = flipVertical === 1 ? -1 : 1;  // Меняем направление отражения
            }
            applyFilters();  // Применяем фильтры и трансформации
        });
    });

    // Применение произвольного угла поворота
    document.getElementById('applyCustomRotate').addEventListener('click', () => {
        const customAngle = document.getElementById('customRotate').value;
        rotateAngle = parseFloat(customAngle);  // Применяем пользовательский угол
        applyFilters();
    });
}

// Показ параметров настройки (яркость, контраст и т.д.)
function showAdjustParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params adjust-params">
        <label for="brightness">Brightness</label>
        <input type="range" id="brightness" min="0" max="200" value="${brightness}">
        
        <label for="contrast">Contrast</label>
        <input type="range" id="contrast" min="0" max="200" value="${contrast}">
        
        <label for="saturation">Saturation</label>
        <input type="range" id="saturation" min="0" max="200" value="${saturation}">
        
        <label for="grayscale">Grayscale</label>
        <input type="range" id="grayscale" min="0" max="100" value="${grayscale}">

        <label for="sepia">Sepia</label>
        <input type="range" id="sepia" min="0" max="100" value="${sepia}">

        <label for="temperature">Temperature (Kelvin)</label>
        <input type="range" id="temperature" min="1000" max="10000" value="${temperature}">
    </div>
    `;

    // Применение настроек фильтров слайдеров
    const sliders = document.querySelectorAll('.adjust-params input[type="range"]');
    sliders.forEach(slider => {
        updateSliderBackground(slider);  // Обновляем цвет фона слайдера

        // Обработчик для изменения значения слайдера
        slider.addEventListener('input', function () {
            updateSliderBackground(slider);  // Обновляем фон при изменении

            // Обновляем параметры в зависимости от выбранного слайдера
            if (slider.id === 'brightness') {
                brightness = slider.value;
            } else if (slider.id === 'contrast') {
                contrast = slider.value;
            } else if (slider.id === 'saturation') {
                saturation = slider.value;
            } else if (slider.id === 'grayscale') {
                grayscale = slider.value;
            } else if (slider.id === 'sepia') {
                sepia = slider.value;
            } else if (slider.id === 'temperature') {
                temperature = slider.value;
            }
            applyFilters();  // Применяем изменения
        });
    });
}

// Функция для обновления фона слайдера
function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #33aada ${value}%, #ccc ${value}%)`;
}

// Применение фильтров и трансформаций к изображению
const applyFilters = () => {
    hue_rotation = calculateHueRotation(temperature);  // Рассчитываем угол поворота оттенков
    editableImage.style.transform = `rotate(${rotateAngle}deg) scale(${flipHorizontal}, ${flipVertical})`;  // Применяем поворот и отражение
    editableImage.style.filter = `
        brightness(${brightness}%) 
        saturate(${saturation}%) 
        contrast(${contrast}%) 
        grayscale(${grayscale}%) 
        sepia(${sepia}%) 
        hue-rotate(${hue_rotation}deg)
    `;
};

// Рассчет поворота оттенков в зависимости от температуры
function calculateHueRotation(temp) {
    const kelvinRange = [1000, 10000];  // Диапазон температуры (Кельвины)
    const hueRange = [-90, 90];  // Диапазон угла поворота оттенков

    const tempPercent = (temp - kelvinRange[0]) / (kelvinRange[1] - kelvinRange[0]);
    const hueRotation = tempPercent * (hueRange[1] - hueRange[0]) + hueRange[0];

    return hueRotation;
}

// Показ параметров фильтров
function showFiltersParams() {
    if (!globalImageSrc) {
        console.error('Путь к изображению не определён');  // Проверка, что изображение загружено
        return;
    }

    console.log(globalImageSrc);

    inspectorContent.innerHTML = `
    <div class="tool-params filters-params">
        <div class="filter-row">
            <div class="filter-group">
                <button id="filterNone" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="None" class="filter-preview" id="previewNone">
                    </div>
                </button>
                <span>None</span>
            </div>
            <div class="filter-group">
                <button id="filterBW" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Black & White" class="filter-preview" id="previewBW">
                    </div>
                </button>
                <span>Black&<br>White</span>
            </div>
        </div>

        <div class="filter-row">
            <div class="filter-group">
                <button id="filterSepia" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Sepia" class="filter-preview" id="previewSepia">
                    </div>
                </button>
                <span>Sepia</span>
            </div>
            <div class="filter-group">
                <button id="filterVintage" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Vintage" class="filter-preview" id="previewVintage">
                    </div>
                </button>
                <span>Vintage</span>
            </div>
        </div>
    </div>
    `;

    applyFiltersForExamples();  // Применяем фильтры к примерам

    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));  // Убираем активный класс со всех кнопок

            button.classList.add('active');  // Добавляем активный класс для выбранного фильтра

            const filterId = event.currentTarget.id;
            applySelectedFilter(filterId);  // Применяем выбранный фильтр
        });
    });
}

// Применение выбранного фильтра
function applySelectedFilter(filterId) {
    if (filterId === 'filterNone') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 0, sepia = 0, temperature = 5500;
    } else if (filterId === 'filterBW') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 100, sepia = 0, temperature = 5500;
    } else if (filterId === 'filterSepia') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 100, sepia = 100, temperature = 5500;
    } else if (filterId === 'filterVintage') {
        brightness = 86, saturation = 111, contrast = 151, grayscale = 0, sepia = 23, temperature = 5500;
    }
    applyFilters();  // Применяем фильтры
}

// Пример применения фильтров к превью
function applyFiltersForExamples() {
    document.getElementById('previewBW').style.filter = 'grayscale(100%)';
    document.getElementById('previewSepia').style.filter = 'sepia(100%)';
    document.getElementById('previewVintage').style.filter = 'contrast(120%) saturate(70%)';
}

// Кнопка для сброса фильтров, поворотов и отражений
document.getElementById('revertButton').addEventListener('click', () => { 
    if (globalImageSrc) {
        editableImage.src = globalImageSrc;  // Возвращаем исходное изображение

        // Сбрасываем повороты и отражения
        rotateAngle = 0;
        flipHorizontal = 1;
        flipVertical = 1;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();
        image.src = globalImageSrc;

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            context.clearRect(0, 0, canvas.width, canvas.height);  // Очищаем холст
            context.drawImage(image, 0, 0, canvas.width, canvas.height);  // Перерисовываем исходное изображение

            editableImage.src = canvas.toDataURL();  // Обновляем изображение

            applyFilters();  // Применяем фильтры по умолчанию (если были изменены)
        };
    }
});
