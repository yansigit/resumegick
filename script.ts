document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll<HTMLLIElement>('#sections li');
    const resumeContent = document.getElementById('resume-content');

    sections.forEach(section => {
        section.addEventListener('dragstart', (event: DragEvent) => {
            event.dataTransfer!.setData('text/plain', section.dataset.section!);
        });
    });

    resumeContent?.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    resumeContent?.addEventListener('drop', (event) => {
        event.preventDefault();
        const sectionType = event.dataTransfer?.getData('text/plain');
        if (sectionType) {
            addResumeSection(sectionType);
        }
    });

    function addResumeSection(sectionType: string) {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('resume-section');
        sectionDiv.innerHTML = `<h2>${sectionType.toUpperCase()}</h2>`;
        sectionDiv.setAttribute('data-section', sectionType);
        resumeContent?.appendChild(sectionDiv);
        addSectionContent(sectionType, sectionDiv);
    }

    function addSectionContent(sectionType: string, sectionDiv: HTMLDivElement) {
        switch (sectionType) {
            case 'contact':
                sectionDiv.innerHTML += `
                    <div class="editable">Name</div>
                    <div class="editable">Email</div>
                    <div class="editable">Phone</div>
                `;
                break;
            case 'experience':
                sectionDiv.innerHTML += `
                    <div class="editable">Job Title</div>
                    <div class="editable">Company</div>
                    <div class="editable">Dates</div>
                    <div class="editable">Description</div>
                `;
                break;
            case 'education':
                sectionDiv.innerHTML += `
                    <div class="editable">School</div>
                    <div class="editable">Degree</div>
                    <div class="editable">Dates</div>
                `;
                break;
            case 'skills':
                sectionDiv.innerHTML += `<div class="editable">Skill</div>`;
                break;
            case 'summary':
                sectionDiv.innerHTML += `<div class="editable">Summary text</div>`;
                break;
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