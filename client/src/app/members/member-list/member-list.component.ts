import { Component, OnInit } from '@angular/core';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/models/member';
import { Pagination } from 'src/app/models/pagination';
import { User } from 'src/app/models/user';
import { UserParams } from 'src/app/models/userParams';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  members: Member[];
  pagination: Pagination = { currentPage: 0, itemsPerPage: 0, totalItems: 0, totalPages: 0};
  userParams: UserParams;
  user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];

  constructor(private memberService:MembersService ) { }

  ngOnInit(): void {
    //this.members$ = this.memberService.getMemebers(1, 3);
    this.loadMembers();
  }

  loadMembers(){
    this.userParams = this.memberService.getUserParams();
    this.memberService.getMemebers(this.userParams).subscribe(response => { 
      this.members = response.result;
      this.pagination = response.pagination; 
    })
  }

  resetMembers(){
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event: any){
    this.userParams.pageNumber = event.page;
    this.memberService.setUserParams(this.userParams);
    this.loadMembers();
  }
}
