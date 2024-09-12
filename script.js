// Константы и элементы DOM
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const fileNameDisplay = document.getElementById('fileName');
const tryAgainButton = document.getElementById('tryAgainButton');
const previewImage = document.getElementById('previewImage');
const previewImg = document.getElementById('previewImg');
const imageName = document.getElementById('imageName');
const editWindow = document.getElementById('editWindow');
const startEditingButton = document.getElementById('startEditingButton');
const closeEditButton = document.getElementById('closeEditButton');
const inspectorContent = document.getElementById('inspectorContent');
const elementsButton = document.getElementById('elementsButton');
const elementsDropdown = document.getElementById('elementsDropdown');
const editableImage = document.getElementById('editableImage');

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png'];

let globalImageSrc = '';

// Загрузка изображения по нажатию
uploadBox.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));

// Изменить выбранное изображение
document.getElementById('replaceImageButton').addEventListener('click', () => {
    fileInput.click();
});

// Удаление изображения и возврат на начальный экран
document.getElementById('deleteImageButton').addEventListener('click', () => {
    previewImg.classList.add('hidden');
    previewImg.classList.add('display-none');
    uploadBox.classList.remove('hidden');
    uploadBox.classList.remove('display-none');
    previewImage.src = ''; // Очищаем изображение
    fileInput.value = ''; // Очищаем поле выбора файла
});



// Показываем или скрываем выпадающий список при нажатии на кнопку Elements
elementsButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Останавливаем всплытие события

    // Получаем позицию кнопки elementsButton
    const buttonRect = elementsButton.getBoundingClientRect();
    
    // Устанавливаем позицию выпадающего списка рядом с кнопкой
    elementsDropdown.style.top = `${buttonRect.bottom + window.scrollY}px`; // Положение под кнопкой
    elementsDropdown.style.left = `${buttonRect.left + window.scrollX}px`; // Выравнивание по левому краю

    // Показываем или скрываем dropdown
    elementsDropdown.classList.toggle('hidden');
    elementsDropdown.classList.toggle('visible');
});

// Скрываем выпадающий список, если щелкнули вне его
document.addEventListener('click', (event) => {
    if (!elementsButton.contains(event.target) && !elementsDropdown.contains(event.target)) {
        elementsDropdown.classList.remove('visible');
        elementsDropdown.classList.add('hidden');
    }
});

// Добавление обработчиков событий для кнопок инструментов
const elementButtons = document.querySelectorAll('.dropdown-button');

elementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const toolName = button.querySelector('span').textContent;
        console.log(`Вы выбрали инструмент: ${toolName}`);
        // Здесь вызывайте функции для выбранных инструментов
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


// Оптимизированный drag-and-drop обработчик
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', handleDrop);

// Кнопка "Попробовать снова" при ошибке
tryAgainButton.addEventListener('click', resetUpload);

// Функция сброса состояния
function resetUpload() {
    fadeOut(errorContainer, () => {
        fadeIn(uploadBox);
        hideLoader(); // Скрываем loader при отображении ошибки
    });
    fileInput.value = ''; // Очистка выбранного файла
}

// Функция скрытия с плавной анимацией
function fadeOut(element, callback) {
    element.classList.add('hidden');
    setTimeout(() => {
        element.classList.add('display-none');
        if (callback) callback();
    }, 500);
}

// Функция показа с плавной анимацией
function fadeIn(element, callback) {
    element.classList.remove('display-none');
    setTimeout(() => {
        element.classList.remove('hidden');
        if (callback) callback();
    }, 10);
}

// Функция показа анимации загрузки
function showLoader(fileName) {
    document.getElementById('loaderText').textContent = `File name ${fileName} is loading`;
    fadeIn(document.getElementById('loader'));
}

// Функция скрытия анимации загрузки
function hideLoader() {
    fadeOut(document.getElementById('loader'));
}

// Функция обработки файла
function handleFile(file) {
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
        showError('Invalid file type. Please upload JPEG or PNG.', file.name);
    } else if (file.size > MAX_SIZE_BYTES) {
        showError(`File size exceeds ${MAX_SIZE_MB}MB limit.`, file.name);
    } else {
        // Показываем анимацию загрузки
        showLoader(file.name);
        
        const imageSrc = URL.createObjectURL(file);

        globalImageSrc = imageSrc;

        // Проверим, что мы получаем корректный URL
        console.log('Загруженный файл:', file);
        console.log('Путь к изображению:', globalImageSrc);

        previewImage.src = URL.createObjectURL(file);
        editableImage.src = URL.createObjectURL(file);
        previewImage.onload = () => {
            URL.revokeObjectURL(previewImage.src); // Освобождаем память после загрузки
            URL.revokeObjectURL(editableImage.src);

            // Переход к режиму предпросмотра с плавной анимацией
            setTimeout(() => {
                fadeOut(uploadBox, () => {
                    fadeIn(previewImg);
                    hideLoader(); // Скрываем loader только после загрузки и показа предпросмотра
                });
            }, 1000); // Время задержки для симуляции загрузки
            URL.revokeObjectURL(imageSrc.src);
        };
    }
}

// Функция отображения ошибки
function showError(message, fileName) {
    errorMessage.textContent = message;
    fileNameDisplay.textContent = `File: ${fileName}`;

    fadeOut(previewImg, () => {
        fadeIn(errorContainer);
        hideLoader(); // Скрываем loader при отображении ошибки
    });

    fadeOut(uploadBox, () => {
        fadeIn(errorContainer);
        hideLoader(); // Скрываем loader при отображении ошибки
    });
}

// Функция обработки dragover
function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('dragover');
}

// Функция обработки события drop
function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleFile(file);
}

// Опциональная функция для работы с несколькими файлами
function handleMultipleFiles(files) {
    if (files.length > 1) {
        showError('Please upload only one file at a time.', '');
    } else {
        handleFile(files[0]);
    }
}

// Функции для отображения параметров инструментов
document.getElementById('cropButton').addEventListener('click', showCropParams);
document.getElementById('resizeButton').addEventListener('click', showResizeParams);
document.getElementById('RotateFlipButton').addEventListener('click', showRotateFlipParams);
document.getElementById('adjustButton').addEventListener('click', showAdjustParams);
document.getElementById('filtersButton').addEventListener('click', showFiltersParams);

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
}

function showResizeParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params resize-params">
        <label for="widthInput">Width (px)</label>
        <input type="number" id="widthInput">
        
        <label for="heightInput">Height (px)</label>
        <input type="number" id="heightInput">
        
        <label for="constrainProportions">
            <input type="checkbox" id="constrainProportions"> Constrain proportions
        </label>
    </div>
    `;
}

function showRotateFlipParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params rotate-flip-params">
        <!-- Надпись Rotate -->
        <label>Rotate</label>
        <div class="button-group">
            <button id="rotateLeftButton">
                <img src="icons/rotate-left.png" alt="Rotate Left">
            </button>
            <button id="rotateRightButton">
                <img src="icons/rotate-right.png" alt="Rotate Right">
            </button>
        </div>

        <!-- Надпись Flip -->
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
}

function showAdjustParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params adjust-params">
        <label for="brightness">Brightness</label>
        <input type="range" id="brightness" min="0" max="100" value="50">
        
        <label for="contrast">Contrast</label>
        <input type="range" id="contrast" min="0" max="100" value="50">
        
        <label for="saturation">Saturation</label>
        <input type="range" id="saturation" min="0" max="100" value="50">
        
        <label for="exposition">Exposition</label>
        <input type="range" id="exposition" min="0" max="100" value="50">
    </div>
    `;

    const sliders = document.querySelectorAll('.adjust-params input[type="range"]');
    sliders.forEach(slider => {
        updateSliderBackground(slider); // Установить начальный цвет
        slider.addEventListener('input', function () {
            updateSliderBackground(slider); // Обновлять цвет при изменении значения
        });
    });
}

function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #33aada ${value}%, #ccc ${value}%)`;
}


function showFiltersParams() {
    if (!globalImageSrc) {
        console.error('Путь к изображению не определён');
        return;
    }

    inspectorContent.innerHTML = `
    <div class="tool-params filters-params">
        <!-- Первая строка с кнопками и подписями -->
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

        <!-- Вторая строка с кнопками и подписями -->
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

    applyFilters(); // Применяем фильтры к изображениям

    // Добавляем обработчики кликов на кнопки фильтров
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем класс active у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Добавляем класс active на нажатую кнопку
            button.classList.add('active');
        });
    });
}


// Функция для применения фильтров
function applyFilters() {
    document.getElementById('previewBW').style.filter = 'grayscale(100%)'; // Чёрно-белый фильтр
    document.getElementById('previewSepia').style.filter = 'sepia(100%)';  // Сепия
    document.getElementById('previewVintage').style.filter = 'contrast(120%) saturate(70%)';  // Винтаж
}