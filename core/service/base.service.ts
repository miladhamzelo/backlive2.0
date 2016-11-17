import { Session, User } from '../lib/session';
import { Database } from '../lib/database';
import { BaseRepository } from '../repository/base.repository';

var Q = require('q');

export class BaseService {
    protected get database(): any { return Database.mongo };
    protected session: Session;
    protected user: User;
    protected promise: Promise<any>;

    private deferred: { resolve: Function, promise: Promise<any> };

    constructor(session: Session, repositories?: { [key: string]: typeof BaseRepository }) {
        this.session = session;
        this.user = session.user
        this.deferred = Q.defer();
        this.promise = this.deferred.promise;
        
        if(repositories) {
            for(var key in repositories) {
                this[key] = new repositories[key]();
            }
        }
    }

	done(data: any) {
		this.deferred.resolve(data);
	}
    
    success(data?: any) {
        var obj = { success: 1 };
        if(data) { obj['data'] = data };
		this.deferred.resolve(obj);
	}
    
    error(msg: string) {
        console.log(msg);
        this.deferred.resolve({ success: 0, msg: msg });
    }

    dbObjectId(oid: string) {
        return new Database.ObjectID(oid);
    }
}