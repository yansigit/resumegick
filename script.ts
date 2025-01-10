declare const html2pdf: any;
const __ENV__ = 'development';

function log(...args: any[]) {
    if (__ENV__ === 'development') {
        console.log(...args);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    log('DOMContentLoaded event started.');
    const sections = document.querySelectorAll<HTMLLIElement>('#sections li');
    log('Sections:', sections);
    const resumeContent = document.getElementById('resume-content');
    log('Resume content:', resumeContent);
    const templateDir = '/templates/';
    log('Template directory:', templateDir);
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    log('Sidebar:', sidebar);
    const drawerButton = document.getElementById('drawer-button');
    log('Drawer button:', drawerButton);
    const saveButton = document.getElementById('saveButton');
    log('Save button:', saveButton);
    const downloadPdfButton = document.getElementById('downloadPdfButton');
    log('Download PDF button:', downloadPdfButton);

    let draggedSection: HTMLElement | null = null;
    log('Dragged section initialized:', draggedSection);

    drawerButton?.addEventListener('click', () => {
        log('Drawer button clicked.');
        sidebar.classList.toggle('closed');
        log('Sidebar class toggled.');
    });

    sections.forEach(section => {
        section.addEventListener('dragstart', (event: DragEvent) => {
            log('Drag start event on section:', section);
            draggedSection = event.target as HTMLElement;
            log('Dragged section set:', draggedSection);
            (event as DragEvent).dataTransfer!.setData('text/plain', section.dataset.section!);
            log('Data transfer set:', section.dataset.section!);
        });
    });

    function setupDragAndDrop() {
        log('Setting up drag and drop.');
        resumeContent?.querySelectorAll('.resume-section').forEach(sectionDiv => {
            (sectionDiv as HTMLElement).addEventListener('dragstart', (event: DragEvent) => {
                log('Drag start event on resume section:', sectionDiv);
                draggedSection = event.target as HTMLElement;
                log('Dragged section set:', draggedSection);
            });
        });

        resumeContent?.addEventListener('dragover', (event) => {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const sectionDiv = target.closest('.resume-section');
            log('Drag over event, target section:', sectionDiv);
            if (sectionDiv && draggedSection && sectionDiv !== draggedSection && draggedSection.classList.contains('resume-section')) {
                const rect = sectionDiv.getBoundingClientRect();
                const mouseY = event.clientY;
                log('Mouse Y:', mouseY, 'Section rect:', rect);
                if (mouseY < rect.top + rect.height / 2) {
                    log('Inserting before:', sectionDiv);
                    resumeContent?.insertBefore(draggedSection, sectionDiv);
                } else {
                    log('Inserting after:', sectionDiv);
                    resumeContent?.insertBefore(draggedSection, sectionDiv.nextSibling);
                }
            }
        });

        resumeContent?.addEventListener('drop', (event) => {
            event.preventDefault();
            log('Drop event.');
            if (draggedSection && draggedSection.hasAttribute('data-section')) {
                const sectionType = (event as DragEvent).dataTransfer?.getData('text/plain');
                log('Dropped section type:', sectionType);
                if (sectionType) {
                    const target = event.target as HTMLElement;
                    const sectionDiv = target.closest('.resume-section');
                    let index = -1;
                    if (sectionDiv) {
                        index = Array.from(resumeContent!.children).indexOf(sectionDiv);
                        log('Drop index:', index);
                    }
                    addResumeSection(sectionType, index);
                }
            }
            draggedSection = null;
            log('Dragged section reset.');
        });
    }

    function addResumeSection(sectionType: string, index?: number) {
        log('Adding resume section:', sectionType, 'at index:', index);
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('resume-section');
        sectionDiv.setAttribute('draggable', 'true');
        sectionDiv.setAttribute('data-section', sectionType);
        addSectionContent(sectionType, sectionDiv);
        sectionDiv.addEventListener('dragstart', (event: DragEvent) => {
            log('Drag start event on new resume section:', sectionDiv);
            draggedSection = event.target as HTMLElement;
            log('Dragged section set:', draggedSection);
        });
        resumeContent?.appendChild(sectionDiv);
    }

    async function addSectionContent(sectionType: string, sectionDiv: HTMLDivElement) {
        log('Adding section content:', sectionType);
        try {
            const response = await fetch(templateDir + sectionType.replace(/ /g, '') + '.html');
            log('Fetched template response:', response);
            const text = await response.text();
            sectionDiv.innerHTML += text;
            addAddMoreListeners(sectionDiv, sectionType); // Add listener for "add more" button
        } catch (error) {
            console.error('Error fetching template:', error);
            sectionDiv.innerHTML += '<p>Error loading section content.</p>';
        }
    }

    function addAddMoreListeners(sectionDiv: HTMLDivElement, sectionType: string) {
        log('Adding "add more" listeners:', sectionType);
        const addMoreButton = sectionDiv.querySelector('.add-more-icon');
        if (addMoreButton) {
            addMoreButton.addEventListener('click', () => {
                log('"Add more" button clicked.');
                const dataTemplate = addMoreButton.getAttribute('data-template');
                const template = addMoreButton.parentElement?.querySelector(`:not(button)[data-template="${dataTemplate}"]`);
                if (template) {
                    const clone = template.cloneNode(true) as HTMLElement;
                    addMoreButton.parentElement?.insertBefore(clone, addMoreButton);
                    log('Cloned and inserted template.');
                }
            });
        }
    }

    resumeContent?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        log('Resume content clicked, target:', target);
        if (target.classList.contains('editable')) {
            target.contentEditable = 'true';
            log('Made editable.');
        }
    });

    resumeContent?.addEventListener('focusout', (event) => {
        const target = event.target as HTMLElement;
        log('Focus out event, target:', target);
        if (target.classList.contains('editable')) {
            target.contentEditable = 'false';
            log('Made not editable.');
        }
    });

    function saveResume() {
        log('Saving resume.');
        const content = resumeContent!.innerHTML;
        const base64Content = btoa(content);
        localStorage.setItem('resumeContent', base64Content);
        alert('Resume saved to local storage!');
        log('Resume saved.');
    }

    function loadResume() {
        log('Loading resume.');
        const savedContent = localStorage.getItem('resumeContent');
        if (savedContent) {
            resumeContent!.innerHTML = atob(savedContent);
            setupDragAndDrop(); // Re-attach drag and drop listeners after loading
            log('Resume loaded and drag and drop setup.');
        }
    }

    function downloadResumePDF() {
        log('Downloading resume as PDF.');
        const resume = document.getElementById('resume-content');
        const addMoreIcons = document.querySelectorAll('.add-more-icon');
        addMoreIcons.forEach(icon => icon.classList.add('hidden-pdf'));
        log('"Add more" icons hidden for PDF.');

        const html2pdfOptions = {
            jsPDF: {
                unit: 'in',
                format: 'letter',
                orientation: 'portrait',
            },
            margin: 0,
            filename: 'resume.pdf',
        }
        html2pdf().set(html2pdfOptions).from(resume).save();
        log('PDF download initiated.');
    }

    saveButton?.addEventListener('click', saveResume);
    downloadPdfButton?.addEventListener('click', downloadResumePDF);
    log('Save and download PDF button listeners added.');

    window.addEventListener('load', () => {
        log('Window load event started.');
        loadResume();
        setupDragAndDrop(); // Attach drag and drop listeners on initial load
        log('Resume loaded and drag and drop setup on window load.');
    });
    log('DOMContentLoaded event finished.');
});