import { TestBed } from '@angular/core/testing';

import { WebSockets } from './web-sockets';

describe('WebSockets', () => {
  let service: WebSockets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSockets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
