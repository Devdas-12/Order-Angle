import {
    Directive,
    Injectable,
    Input,
    EventEmitter,
    Output,
    ElementRef,
    HostListener,
} from '@angular/core';

@Directive({
    selector: '[scrollSpy]',
})
export class ScrollSpyDirective {
    @Input() public spiedTags: any = [];
    @Output() public sectionChange = new EventEmitter<string>();
    private currentSection!: string;

    constructor(private _el: ElementRef) { }

    @HostListener('window:scroll', ['$event'])
    onScroll(event: any) {
        // let currentSection: string = '';
        // const children = this._el.nativeElement.children;
        // const scrollTop = event.target.scrollingElement.scrollTop;
        // const parentOffset = event.target.scrollingElement.offsetTop;

        // for (let i = 0; i < children.length; i++) {
        //     const element = children[i];
        //     const position = element.getBoundingClientRect()

        //     if (this.spiedTags.some((spiedTag : any) => spiedTag === element.tagName)) { 
        //         if (element.offsetTop - parentOffset - 110 <= scrollTop) {
        //             currentSection = element.id;
        //         }
        //     }
        // }
        // if (currentSection !== this.currentSection) {
        //     this.currentSection = currentSection;
        //     this.sectionChange.emit(this.currentSection);
        // }

        let currentSection: string = '';
        const children = this._el.nativeElement.children;
        const viewportHeight = window.innerHeight;
        const scrollTop = event.target.scrollingElement.scrollTop
        const parentOffset = event.target.scrollingElement.offsetTop;

        const centerOffset = parentOffset + (viewportHeight / 2); // Calculate the center of the viewport

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            if (this.spiedTags.some((spiedTag: any) => spiedTag === element.tagName)) {
                const elementOffset = element.offsetTop - parentOffset; // Offset of the element from the top of the scrolling container
                const elementHeight = element.offsetHeight;
                const elementCenter = element.getBoundingClientRect().top; // Calculate the center of the element

                if (elementCenter > 108 && elementCenter <= centerOffset) { // Check if the center of the element is above the center of the viewport
                    currentSection = element.id;
                } else {
                    if (element.offsetTop - parentOffset - 110 <= scrollTop) {
                        currentSection = element.id;
                    }
                }
            }
        }
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.sectionChange.emit(this.currentSection);
        }

    }
}