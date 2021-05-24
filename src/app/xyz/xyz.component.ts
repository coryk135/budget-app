import { fn } from '@angular/compiler/src/output/output_ast';
import { Component, HostListener, OnInit } from '@angular/core';

interface Data {
  date: string;
  amount: number;
  text: string;
}

@Component({
  selector: 'app-xyz',
  templateUrl: './xyz.component.html',
  styleUrls: ['./xyz.component.css'],
})
export class XyzComponent implements OnInit {
  accountName = 'My checking';
  currBalance = 1000;

  startingBalance = 1000;
  startingDate = 'Feb 14, 2021';
  data: Data[] = [
    { date: 'Feb 19, 2021', amount: 2500, text: 'Payday' },
    { date: 'Feb 26, 2021', amount: -300, text: 'HOA' },
    { date: 'Mar 1, 2021', amount: -1200, text: 'Mortgage' },
    { date: 'Mar 1, 2021', amount: -1700, text: 'Rent' },
    { date: 'Mar 1, 2021', amount: 1800, text: 'Rent income' },
    { date: 'Mar 5, 2021', amount: 2500, text: 'Payday' },
    { date: 'Mar 19, 2021', amount: 2500, text: 'Payday' },
    { date: 'Mar 29, 2021', amount: -300, text: 'HOA' },
    { date: 'Apr 1, 2021', amount: -1200, text: 'Mortgage' },
    { date: 'Apr 1, 2021', amount: -1700, text: 'Rent' },
    { date: 'Apr 1, 2021', amount: 1800, text: 'Rent income' },
    { date: 'Apr 2, 2021', amount: 2500, text: 'Payday' },
    { date: 'Apr 16, 2021', amount: 2500, text: 'Payday' },
  ];
  balances: { balance: number; scrollY: number }[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Query all the budget items elements. The first one is the starting balance which isn't part of the data array
    // so have to manually add that one first.
    const els = document.querySelectorAll('.budget .budget-item') as any;
    let balance = this.startingBalance;
    // Minus 256 to account for the `top: 256px;` css attribute on the "current balance" element.
    this.balances.push({ balance, scrollY: els[0].offsetTop - els[0].parentElement.offsetTop - 256 });
    // Skip the first index of the els because it's just the starting balance and we already added that.
    let i = 1;
    for (let { amount } of this.data) {
      balance += amount;
      this.balances.push({ balance, scrollY: els[i].offsetTop - els[i].parentElement.offsetTop - 256 });
      // Uncomment this for fun to adjust the width of a budget-item based on its amount.
      // els[i].style.width = Math.abs(amount / 10) + 'px';
      i++;
    }
  }

  // Scroll throttling https://css-tricks.com/debouncing-throttling-explained-examples/
  latestKnownScrollY = 0;
  ticking = false;
  onScroll(event: any) {
    this.latestKnownScrollY = event.target.scrollTop;
    this.requestTick();
  }

  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
      });
    }
    this.ticking = true;
  }

  update() {
    // reset the tick so we can
    // capture the next onScroll
    this.ticking = false;

    // update current balance.
    this.currBalance = this.currBalanceFromScrollPosition(this.latestKnownScrollY);
  }

  currBalanceFromScrollPosition(pos: number) {
    let cur = this.startingBalance;
    for (let i = 0; i < this.balances.length; i++) {
      const balance = this.balances[i];
      if (balance.scrollY > this.latestKnownScrollY) break;
      cur = balance.balance;
    }
    return cur;
  }

  calcNumDotsBetweenDates(date1: string, date2: string) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    // Currently one dot for each day.
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }
}

/**
 * Not used... but it can be! Waits for delay seconds after the last time debounce is called to call fn.
 *
 * example:
 *  debounce('scroll', 300, () => {
 *    this.update();
 *  });
 */
const debounceMap: { [key: string]: { id: number } } = {};
function debounce(tag: string, delay: number, fn: Function) {
  if (!debounceMap[tag]) {
    debounceMap[tag] = { id: 0 };
  } else {
    clearTimeout(debounceMap[tag].id);
    debounceMap[tag].id = window.setTimeout(function () {
      fn();
    }, delay);
  }
}
