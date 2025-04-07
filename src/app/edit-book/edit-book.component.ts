import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-book',
  imports: [],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.scss'
})
export class EditBookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  bookId2: string | null | undefined;
  
  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    this.bookId2 = bookId;
    // if (bookId) {
    //   this.apiService.getBookById(bookId).subscribe(book => {
    //     this.bookForm.patchValue(book);
    //   });
    // }
  }

}
