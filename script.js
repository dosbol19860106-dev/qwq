document.addEventListener('DOMContentLoaded', () => {
    // 1. Негізгі элементтерді таңдау
    const searchInput = document.getElementById('searchInput');
    const classFilter = document.getElementById('classFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const materialsGrid = document.getElementById('materialsGrid');
    const subjectCards = document.querySelectorAll('.subject-card');

    // Модаль терезе элементтері
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');

    // 2. Сүзгілеу (Filtering) логикасы
    function filterMaterials() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedClass = classFilter.value;
        const selectedSubject = subjectFilter.value;
        const selectedType = typeFilter.value;

        const cards = materialsGrid.querySelectorAll('.material-card');

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const cardSubject = card.dataset.subject;
            const cardClass = card.dataset.class;
            const cardType = card.dataset.type;

            const matchesSearch = title.includes(query) || desc.includes(query);
            const matchesClass = (selectedClass === 'all') || (cardClass === selectedClass);
            const matchesSubject = (selectedSubject === 'all') || (cardSubject === selectedSubject);
            const matchesType = (selectedType === 'all') || (cardType === selectedType);

            if (matchesSearch && matchesClass && matchesSubject && matchesType) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Сүзгі оқиғалары
    searchInput.addEventListener('input', filterMaterials);
    classFilter.addEventListener('change', filterMaterials);
    subjectFilter.addEventListener('change', filterMaterials);
    typeFilter.addEventListener('change', filterMaterials);

    // Сүзгілерді тазалау
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        classFilter.value = 'all';
        subjectFilter.value = 'all';
        typeFilter.value = 'all';
        filterMaterials();
    });

    // Танымал пән карточкаларын басқанда авто-фильтр
    subjectCards.forEach(card => {
        card.addEventListener('click', () => {
            const subjectName = card.dataset.subjectBtn;
            subjectFilter.value = subjectName;
            filterMaterials();
        });
    });

    // 3. ЖҮКТЕУ (Download) батырмасын актив ету
    materialsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('download-btn')) {
            const btn = e.target;
            const card = btn.closest('.material-card');
            const downloadsCountElem = card.querySelector('.downloads .count');
            
            // Жүктелу санын 1-ге көбейту
            let currentCount = parseInt(downloadsCountElem.textContent) || 0;
            downloadsCountElem.textContent = currentCount + 1;

            // Файлды жүктеуге жіберу
            const fileUrl = btn.dataset.url;
            const fileName = btn.dataset.filename || 'Material.pdf';

            if (fileUrl) {
                const tempLink = document.createElement('a');
                tempLink.href = fileUrl;
                tempLink.download = fileName;
                tempLink.target = '_blank';
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            } else {
                alert('Файл сәтті жүктелді!');
            }
        }
    });

    // 4. Модальді терезе оқиғалары (ЖАҢА МАТЕРИАЛ ЖҮКТЕУ)
    openModalBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => uploadModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.style.display = 'none';
    });

    // Форманы жіберу арқылы жаңа файл қосу
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('inputTitle').value;
        const subject = document.getElementById('inputSubject').value;
        const cls = document.getElementById('inputClass').value;
        const type = document.getElementById('inputType').value;
        const desc = document.getElementById('inputDesc').value;
        const fileInput = document.getElementById('inputFile');

        const file = fileInput.files[0];
        let fileObjectURL = '#';
        let fileName = 'файл.pdf';

        if (file) {
            // Компьютердегі файлға уақытша сілтеме жасау (URL)
            fileObjectURL = URL.createObjectURL(file);
            fileName = file.name;
        }

        // Иконкалар мен түстерді таңдау
        let iconClass = 'icon-teal';
        let faIcon = 'fa-file-pdf';
        if (type === 'Зертханалық') { iconClass = 'icon-navy'; faIcon = 'fa-file-word'; }
        if (type === 'Презентация') { iconClass = 'icon-green'; faIcon = 'fa-file-powerpoint'; }

        // Жаңа карточканың HTML-ін құру
        const newCard = document.createElement('div');
        newCard.className = 'material-card';
        newCard.dataset.subject = subject;
        newCard.dataset.class = cls;
        newCard.dataset.type = type;

        newCard.innerHTML = `
            <div class="card-header">
                <div class="card-type-icon ${iconClass}">
                    <i class="fa-solid ${faIcon}"></i>
                </div>
                <div class="card-title-group">
                    <h3>${title}</h3>
                    <span>(${type})</span>
                </div>
            </div>
            <p class="card-desc">${desc || 'Сипаттамасы енгізілмеген.'}</p>
            <p class="card-meta">Қанып ${cls} сынып, ${type}</p>
            <div class="card-footer">
                <span class="downloads"><i class="fa-solid fa-download"></i> <span class="count">0</span></span>
                <button class="download-btn" data-url="${fileObjectURL}" data-filename="${fileName}">ЖҮКТЕУ</button>
            </div>
        `;

        // Тізімнің ең басына жаңа карточканы орналастыру
        materialsGrid.prepend(newCard);

        // Форманы тазалау және модальды жабу
        uploadForm.reset();
        uploadModal.style.display = 'none';
        filterMaterials();
    });
});