CREATE TABLE Employees (
    ID INT PRIMARY KEY IDENTITY(1,1),
    -- Data about the employee
    IdentityNumber VARCHAR(32) NOT NULL,
    Phone VARCHAR(24) NOT NULL,
    Salary DECIMAL(10,2) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    -- Access related
    Email VARCHAR(50) NOT NULL,
    AccessKey VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Database checks
    CONSTRAINT UQ_Employees_IdentityNumber UNIQUE (IdentityNumber),
    CONSTRAINT UQ_Employees_Email UNIQUE (Email),
    CONSTRAINT CHK_Employees_Role CHECK (Role IN ('Manager', 'Receptionist', 'Housekeeper', 'Maintenance')),
    CONSTRAINT CHK_Employees_Salary CHECK (Salary >= 0)
);

CREATE TABLE Clients (
    ID INT PRIMARY KEY IDENTITY(1,1),
    -- Data about the client
    Name VARCHAR(100) NOT NULL,
    IdentityNumber VARCHAR(32) NOT NULL,
    Phone VARCHAR(24) NOT NULL,
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_Clients_IdentityNumber UNIQUE (IdentityNumber)
);

CREATE TABLE RoomType (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Description VARCHAR(50) NOT NULL,
    MaxOccupancy INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CHK_RoomType_Price CHECK (Price >= 0)
);

CREATE TABLE Rooms (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Number VARCHAR(20) NOT NULL,
    RoomTypeID INT NOT NULL,
    Description VARCHAR(500) NOT NULL,
    State VARCHAR(10) NOT NULL,
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Relations
    FOREIGN KEY (RoomTypeID) REFERENCES RoomType(ID),
    CONSTRAINT CHK_Rooms_State CHECK (State IN ('Avaliable', 'Occupied', 'Maintenance')),
);

CREATE TABLE Reservations (
    ID INT PRIMARY KEY IDENTITY(1,1),
    -- Data about the reservation
    ClientID INT NOT NULL,
    RoomID INT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',

    -- Dates
    CheckInDate DATETIME NOT NULL,
    CheckOutDate DATETIME NOT NULL,
    Charge DECIMAL(10,2) NOT NULL, -- Final cost
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Relations
    FOREIGN KEY (ClientID) REFERENCES Clients(ID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(ID),

    -- Database checks
    CONSTRAINT CHK_Reservations_Dates CHECK (CheckOutDate > CheckInDate),
    CONSTRAINT CHK_Reservations_Charge CHECK (Charge >= 0),
    CONSTRAINT CHK_Reservations_Status CHECK (Status IN ('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'))
);

CREATE TABLE Sessions (
    ID INT PRIMARY KEY IDENTITY(1,1),
    EmployeeID INT NOT NULL,
    SessionKey VARCHAR(255) NOT NULL,
    ExpirationDate DATETIME NOT NULL,
    -- Metadata
    Active BIT NOT NULL DEFAULT 1,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),

    -- Relations
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID),

    -- Database checks
    CONSTRAINT UQ_Sessions_SessionKey UNIQUE (SessionKey)
);

-- Some indexing cuz yea, I dont believe its gonna be a lot of data around but Ig since we're flexing we might as well do it everywhere
CREATE INDEX IX_Reservations_ClientID ON Reservations (ClientID);
CREATE INDEX IX_Reservations_RoomID ON Reservations (RoomID);
CREATE INDEX IX_Sessions_EmployeeID ON Sessions (EmployeeID);
