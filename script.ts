document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll<HTMLLIElement>('#sections li');
    const resumeContent = document.getElementById('resume-content');
    const templateDir = '/templates/';

    let draggedSection: HTMLElement | null = null;

    sections.forEach(section => {
        section.addEventListener('dragstart', (event: DragEvent) => {
            draggedSection = event.target as HTMLElement;
            event.dataTransfer!.setData('text/plain', section.dataset.section!);
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
            const sectionType = event.dataTransfer?.getData('text/plain');
            if (sectionType) {
                addResumeSection(sectionType);
            }
        }
        draggedSection = null;
    });

    function addResumeSection(sectionType: string) {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('resume-section');
        sectionDiv.setAttribute('draggable', 'true');
        sectionDiv.innerHTML = `<h2>${sectionType.toUpperCase()}</h2>`;
        sectionDiv.setAttribute('data-section', sectionType);
        addSectionContent(sectionType, sectionDiv);
        resumeContent?.appendChild(sectionDiv);

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
                const template = addMoreButton.previousElementSibling;
                if (template) {
                    const clone = template.cloneNode(true) as HTMLElement;
                    sectionDiv.insertBefore(clone, addMoreButton);
                }
            });
        }
    }

    resumeContent?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('editable')) {
            target.contentEditable = 'true';
            target.focus();
        }
    });

    resumeContent?.addEventListener('focusout', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('editable')) {
            target.contentEditable = 'false';
        }
    });
});