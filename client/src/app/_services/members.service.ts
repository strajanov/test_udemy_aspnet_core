import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { User } from '../models/user';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  membersMap = new Map();
  userParams: UserParams;
  user: User;
  
  constructor(private http: HttpClient, private accountService: AccountService) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe(
      user => {
        this.user = user;
        this.userParams = new UserParams(this.user);
      }
    )
  }

  getUserParams()
  {
    return this.userParams;
  }

  setUserParams(params: UserParams)
  {
    this.userParams = params;
  }

  resetUserParams(){
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMemebers(userParams: UserParams){
   
    let members = this.membersMap.get(Object.values(userParams).join('-'))
    if(members){
      return of(members);
    }
    let params = this.getPaginatioHeader(userParams.pageNumber, userParams.pageSize);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('minAge', userParams.minAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    
    console.log(params.toString());
    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params)
      .pipe(map( response => {
        this.membersMap.set(Object.values(userParams).join('-'), response);
        return response;
      }));
  }

  getMember(username: string){
    let members = [... this.membersMap.values()]
      .reduce((resArr, currentPage) => {  
        resArr = [...resArr, currentPage.result];
        return resArr; 
      }, []);

    members = members.flat();
    const member = members.find( (m: Member) => m.username === username );
  
    if (member !== undefined) {
      return of(member);
    }
    
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() =>{
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>()
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') != null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }

  private getPaginatioHeader(pageNumber: number, pageSize: number){
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    return params;
  }
}
