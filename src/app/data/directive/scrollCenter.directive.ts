import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[scrollCenter]'
})
export class ScrollCenterDirective {
    @Input() scrollCenterSelector!: string;

    constructor(private el: ElementRef) { }

    @HostListener('click') onClick() {
        const clickedElement = this.el.nativeElement;
        clickedElement.classList.add('active');
        this.scrollCenter(this.scrollCenterSelector);
    }

    scrollCenter(selector: string) {
        const element: any = document.querySelector(selector);

        if (element) {
            const active: any = element.querySelector('.tab-active');

            if (active) {
                
                let elementStyle : any = getComputedStyle(active) ;
                let elementWidth = active.clientWidth - (parseFloat(elementStyle.paddingLeft) + parseFloat(elementStyle.paddingRight));
                let elementPositions : any = active.getBoundingClientRect()
                // return properties;
                const activeWidth = elementWidth / 2;
                const pos = elementPositions.left + activeWidth;
                const currentScroll = element.scrollLeft;
                const divWidth = element.offsetWidth;                
                const newPos = pos + currentScroll - divWidth / 2;
                element.scrollTo({
                    left: newPos,
                    behavior: 'smooth'
                });
            }
        }
    }
}