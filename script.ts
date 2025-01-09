import jsPDF from "jspdf";

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll<HTMLLIElement>('#sections li');
    const resumeContent = document.getElementById('resume-content');
    const templateDir = '/templates/';
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    const drawerButton = document.getElementById('drawer-button');
    const saveButton = document.getElementById('saveButton');
    const downloadPdfButton = document.getElementById('downloadPdfButton');

    let draggedSection: HTMLElement | null = null;

    drawerButton?.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
    });

    sections.forEach(section => {
        section.addEventListener('dragstart', (event: DragEvent) => {
            draggedSection = event.target as HTMLElement;
            (event as DragEvent).dataTransfer!.setData('text/plain', section.dataset.section!);
        });
    });

    function setupDragAndDrop() {
        resumeContent?.querySelectorAll('.resume-section').forEach(sectionDiv => {
            (sectionDiv as HTMLElement).addEventListener('dragstart', (event: DragEvent) => {
                draggedSection = event.target as HTMLElement;
            });
        });

        resumeContent?.addEventListener('dragover', (event) => {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const sectionDiv = target.closest('.resume-section');
            if (sectionDiv && draggedSection && sectionDiv !== draggedSection && draggedSection.classList.contains('resume-section')) {
                const rect = sectionDiv.getBoundingClientRect();
                const mouseY = event.clientY;
                if (mouseY < rect.top + rect.height / 2) {
                    resumeContent?.insertBefore(draggedSection, sectionDiv);
                } else {
                    resumeContent?.insertBefore(draggedSection, sectionDiv.nextSibling);
                }
            }
        });

        resumeContent?.addEventListener('drop', (event) => {
            event.preventDefault();
            if (draggedSection && draggedSection.hasAttribute('data-section')) {
                const sectionType = (event as DragEvent).dataTransfer?.getData('text/plain');
                if (sectionType) {
                    const target = event.target as HTMLElement;
                    const sectionDiv = target.closest('.resume-section');
                    let index = -1;
                    if (sectionDiv) {
                        index = Array.from(resumeContent!.children).indexOf(sectionDiv);
                    }
                    addResumeSection(sectionType, index);
                }
            }
            draggedSection = null;
        });
    }

    function addResumeSection(sectionType: string, index?: number) {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('resume-section');
        sectionDiv.setAttribute('draggable', 'true');
        sectionDiv.setAttribute('data-section', sectionType);
        addSectionContent(sectionType, sectionDiv);
        sectionDiv.addEventListener('dragstart', (event: DragEvent) => {
            draggedSection = event.target as HTMLElement;
        });
    }

    async function addSectionContent(sectionType: string, sectionDiv: HTMLDivElement) {
        try {
            const response = await fetch(templateDir + sectionType.replace(/ /g, '') + '.html');
            const text = await response.text();
            sectionDiv.innerHTML += text;
            addAddMoreListeners(sectionDiv, sectionType); // Add listener for "add more" button
        } catch (error) {
            console.error('Error fetching template:', error);
            sectionDiv.innerHTML += '<p>Error loading section content.</p>';
        }
    }

    function addAddMoreListeners(sectionDiv: HTMLDivElement, sectionType: string) {
        const addMoreButton = sectionDiv.querySelector('.add-more-icon');
        if (addMoreButton) {
            addMoreButton.addEventListener('click', () => {
                const dataTemplate = addMoreButton.getAttribute('data-template');
                const template = addMoreButton.parentElement?.querySelector(`:not(button)[data-template="${dataTemplate}"]`);
                if (template) {
                    const clone = template.cloneNode(true) as HTMLElement;
                    addMoreButton.parentElement?.insertBefore(clone, addMoreButton);
                }
            });
        }
    }

    resumeContent?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('editable')) {
            target.contentEditable = 'true';
        }
    });

    resumeContent?.addEventListener('focusout', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('editable')) {
            target.contentEditable = 'false';
        }
    });

    function saveResume() {
        const content = resumeContent!.innerHTML;
        const base64Content = btoa(content);
        localStorage.setItem('resumeContent', base64Content);
        alert('Resume saved to local storage!');
    }

    function loadResume() {
        const savedContent = localStorage.getItem('resumeContent');
        if (savedContent) {
            resumeContent!.innerHTML = atob(savedContent);
            setupDragAndDrop(); // Re-attach drag and drop listeners after loading
        }
    }

    function downloadResumePDF() {
        const resume = document.getElementById('resume-content');
        const addMoreIcons = document.querySelectorAll('.add-more-icon');
        addMoreIcons.forEach(icon => icon.classList.add('hidden-pdf'));

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
    }

    saveButton?.addEventListener('click', saveResume);
    downloadPdfButton?.addEventListener('click', downloadResumePDF);

    window.addEventListener('load', () => {
        loadResume();
        setupDragAndDrop(); // Attach drag and drop listeners on initial load
    });
});