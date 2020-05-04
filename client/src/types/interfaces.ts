import { E_ERROR } from "./enum";

// React
export interface ITarget {
  target: {
    value: React.SetStateAction<string>;
  };
  preventDefault(): void;
}

export interface ITargetNumber {
  target: {
    value: React.SetStateAction<number>;
  };
  preventDefault(): void;
}

//Errors
export interface IMsg {
  msg: string | any;
}

// ***************
//  Auth
// ***************
export interface IUser {
  name?: string;
  email: string;
  password: string;
}

export interface IError {
  id: E_ERROR;
  msg: IMsg;
}

export interface IAuthForm {
  isAuthenticated?: boolean;
  error: IError;
  clearErrors(): void;
}

export interface ILogin extends IAuthForm {
  login(user: IUser): void;
}

export interface IRegister extends IAuthForm {
  register(user: IUser): void;
}

export interface ILogout {
  logout(): Promise<void>;
}

export interface IAuthFunction {
  name?: string;
  email: string;
  password: string;
}

export interface IAuthReduxProps {
  auth: { isAuthenticated: boolean };
  error: IError;
}

// ***************
//  Navbar
// ***************
export interface IAppNavbar {
  auth?: {
    isAuthenticated: boolean;
    user: IUser;
  };
}

// ***************
//  Context
// ***************

export interface IAction {
  type: string;
  payload?: any;
}
