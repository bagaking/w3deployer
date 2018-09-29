# design

## Roles and procedure

### truffle/preparing procedure

1. *.sol -->|truffler| (contractStr, boxData)

### deployer : deploy procedure

1. connStr --> deployer
2. (contractStr, boxData) -->|deployer| (contractStr, box)
3. deployInfo{contractStr,from,args} -->|deployer| board

### factory : factory procedure

1. dconf.buildPath --> factory
2. dconf.networks -->|factory| (connStr, ...boxData, ...deployInfo)
3. **||deploy procedure||** of each --> deployedBoards
4. (dconf.scriptPath, deployedBoards) --> deployedBoards(initiated)

### holder : ensure procedure

1. deployedBoards(initiated) --> |holder| --> dconfExtra
2. **||factory procedure||** for dconfExtra -->  deployedBoardsExtra(initiated)
3. (deployedBoards(initiated), deployedBoardsExtra(initiated)) --> deployedBoards(ensured)

### holder: holder procedure

1. **|| holder procedure (ensure) ||** --> deployedBoards(ensured)
2. deployedBoards(ensured) --> |holder| reactors

## plan

1. [ ] try catch
2. [ ] deploy script, and loading script
3. [ ] extra script