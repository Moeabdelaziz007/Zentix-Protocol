// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AIZOrchestrator.sol";
import "./AIZRegistry.sol";
import "./IntentBus.sol";
import "./ConsciousDecisionLogger.sol";

/**
 * @title GeneticEvolutionAgent
 * @dev An AIZ that creates and evolves new strategies using genetic algorithms
 */
contract GeneticEvolutionAgent is AIZOrchestrator {
    // Structure to represent a strategy gene
    struct StrategyGene {
        bytes32 geneId;
        string name;
        uint256 value; // 0-100 scale
        uint256 weight; // Importance weight 0-100
        string description;
    }

    // Structure to represent a strategy genome
    struct StrategyGenome {
        bytes32 genomeId;
        bytes32 parentId1;
        bytes32 parentId2;
        StrategyGene[] genes;
        uint256 fitness; // 0-1000 scale
        uint256 generation;
        uint256 createdAt;
        bool isActive;
    }

    // Structure to represent a test result
    struct TestResult {
        bytes32 genomeId;
        uint256 profitability;
        uint256 risk;
        uint256 stability;
        uint256 timestamp;
        bool passed;
    }

    // Structure to represent a tournament for competitive self-play
    struct GenomeTournament {
        bytes32 id;
        bytes32[] participants;
        mapping(bytes32 => uint256) scores; // Genome ID to score
        uint256 createdAt;
        uint256 completedAt;
        bool isCompleted;
    }

    // Structure to represent a deployed strategy
    struct EvolvedStrategy {
        bytes32 strategyId;
        bytes32 genomeId;
        string name;
        string description;
        address deploymentAddress;
        uint256 deploymentTimestamp;
        uint256 performanceScore;
        bool isActive;
    }

    // Storage mappings
    mapping(bytes32 => StrategyGenome) public strategyGenomes;
    mapping(bytes32 => TestResult) public testResults;
    mapping(bytes32 => EvolvedStrategy) public evolvedStrategies;
    mapping(bytes32 => bytes32[]) public genomeLineage;
    mapping(bytes32 => GenomeTournament) public genomeTournaments;
    
    uint256 public genomeCount;
    uint256 public testResultCount;
    uint256 public strategyCount;
    uint256 public tournamentCount;
    address public intentBusAddress;

    // Genetic algorithm parameters
    uint256 public constant MUTATION_RATE = 10; // 10% chance of mutation
    uint256 public constant CROSSOVER_RATE = 70; // 70% chance of crossover
    uint256 public constant POPULATION_SIZE = 10;
    uint256 public constant ELITE_COUNT = 2;
    uint256 public constant TOURNAMENT_SIZE = 5; // Number of participants in each tournament

    // Events
    event GenomeCreated(bytes32 indexed genomeId, uint256 generation);
    event GenomeTested(bytes32 indexed genomeId, uint256 fitness, bool passed);
    event StrategyEvolved(bytes32 indexed strategyId, bytes32 genomeId, string name);
    event StrategyDeployed(bytes32 indexed strategyId, address deploymentAddress);
    event TournamentCreated(bytes32 indexed tournamentId, uint256 participantCount);
    event TournamentCompleted(bytes32 indexed tournamentId, bytes32 winnerId, uint256 winnerScore);
    
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _intentBus,
        address _decisionLogger,
        string memory _aizName,
        string memory _aizDescription
    ) AIZOrchestrator(_aizId, _aizRegistry, _decisionLogger, _aizName, _aizDescription) {
        intentBusAddress = _intentBus;
    }

    /**
     * @dev Create a new random genome
     * @param _name The name of the genome
     * @return bytes32 The ID of the created genome
     */
    function createRandomGenome(string memory _name) external onlyAuthorized returns (bytes32) {
        genomeCount++;
        bytes32 genomeId = keccak256(abi.encodePacked(_name, genomeCount, block.timestamp));
        
        StrategyGenome storage genome = strategyGenomes[genomeId];
        genome.genomeId = genomeId;
        genome.generation = 1;
        genome.createdAt = block.timestamp;
        genome.isActive = true;
        
        // Create random genes
        genome.genes.push(StrategyGene({
            geneId: keccak256(abi.encodePacked("risk_tolerance")),
            name: "Risk Tolerance",
            value: uint256(keccak256(abi.encodePacked(block.timestamp, 1))) % 101,
            weight: 80,
            description: "How much risk the strategy is willing to take"
        }));
        
        genome.genes.push(StrategyGene({
            geneId: keccak256(abi.encodePacked("return_expectation")),
            name: "Return Expectation",
            value: uint256(keccak256(abi.encodePacked(block.timestamp, 2))) % 101,
            weight: 90,
            description: "Expected return rate of the strategy"
        }));
        
        genome.genes.push(StrategyGene({
            geneId: keccak256(abi.encodePacked("time_horizon")),
            name: "Time Horizon",
            value: uint256(keccak256(abi.encodePacked(block.timestamp, 3))) % 101,
            weight: 70,
            description: "Investment time horizon in days"
        }));
        
        genome.genes.push(StrategyGene({
            geneId: keccak256(abi.encodePacked("diversification")),
            name: "Diversification",
            value: uint256(keccak256(abi.encodePacked(block.timestamp, 4))) % 101,
            weight: 85,
            description: "How diversified the strategy is"
        }));
        
        emit GenomeCreated(genomeId, 1);
        
        return genomeId;
    }

    /**
     * @dev Create a child genome through crossover and mutation
     * @param _parent1Id The ID of the first parent genome
     * @param _parent2Id The ID of the second parent genome
     * @param _name The name of the child genome
     * @return bytes32 The ID of the created genome
     */
    function createChildGenome(
        bytes32 _parent1Id, 
        bytes32 _parent2Id, 
        string memory _name
    ) external onlyAuthorized returns (bytes32) {
        StrategyGenome storage parent1 = strategyGenomes[_parent1Id];
        StrategyGenome storage parent2 = strategyGenomes[_parent2Id];
        
        require(parent1.isActive, "Parent 1 is not active");
        require(parent2.isActive, "Parent 2 is not active");
        
        genomeCount++;
        bytes32 genomeId = keccak256(abi.encodePacked(_name, genomeCount, block.timestamp));
        
        StrategyGenome storage genome = strategyGenomes[genomeId];
        genome.genomeId = genomeId;
        genome.parentId1 = _parent1Id;
        genome.parentId2 = _parent2Id;
        genome.generation = Math.max(parent1.generation, parent2.generation) + 1;
        genome.createdAt = block.timestamp;
        genome.isActive = true;
        
        // Perform crossover and mutation
        for (uint256 i = 0; i < parent1.genes.length; i++) {
            // Crossover - randomly select gene from either parent
            StrategyGene memory selectedGene;
            if (uint256(keccak256(abi.encodePacked(block.timestamp, i))) % 2 == 0) {
                selectedGene = parent1.genes[i];
            } else {
                selectedGene = parent2.genes[i];
            }
            
            // Mutation - randomly adjust gene value
            if (uint256(keccak256(abi.encodePacked(block.timestamp, i, "mutate"))) % 100 < MUTATION_RATE) {
                int256 mutation = int256(uint256(keccak256(abi.encodePacked(block.timestamp, i, "mutation"))) % 21) - 10; // -10 to +10
                int256 newValue = int256(selectedGene.value) + mutation;
                selectedGene.value = uint256(Math.max(0, Math.min(100, newValue)));
            }
            
            genome.genes.push(selectedGene);
        }
        
        // Record lineage
        genomeLineage[_parent1Id].push(genomeId);
        genomeLineage[_parent2Id].push(genomeId);
        
        emit GenomeCreated(genomeId, genome.generation);
        
        return genomeId;
    }

    /**
     * @dev Test a genome and record results
     * @param _genomeId The ID of the genome to test
     * @param _profitability The profitability score (0-100)
     * @param _risk The risk score (0-100)
     * @param _stability The stability score (0-100)
     */
    function testGenome(
        bytes32 _genomeId,
        uint256 _profitability,
        uint256 _risk,
        uint256 _stability
    ) external onlyAuthorized {
        StrategyGenome storage genome = strategyGenomes[_genomeId];
        require(genome.isActive, "Genome is not active");
        
        testResultCount++;
        TestResult storage result = testResults[testResultCount];
        result.genomeId = _genomeId;
        result.profitability = _profitability;
        result.risk = _risk;
        result.stability = _stability;
        result.timestamp = block.timestamp;
        
        // Calculate fitness score (weighted average)
        // Higher profitability and stability are better, lower risk is better
        uint256 fitness = (_profitability * 40 + (100 - _risk) * 30 + _stability * 30) / 100;
        result.passed = fitness >= 700; // 70% threshold to pass
        
        genome.fitness = fitness;
        
        emit GenomeTested(_genomeId, fitness, result.passed);
    }

    /**
     * @dev Create a tournament for competitive self-play
     * @param _participantIds Array of genome IDs to compete
     * @param _name Name for the tournament
     * @return bytes32 The ID of the created tournament
     */
    function createTournament(
        bytes32[] memory _participantIds,
        string memory _name
    ) external onlyAuthorized returns (bytes32) {
        require(_participantIds.length >= 2, "At least 2 participants required");
        
        tournamentCount++;
        bytes32 tournamentId = keccak256(abi.encodePacked(_name, tournamentCount, block.timestamp));
        
        GenomeTournament storage tournament = genomeTournaments[tournamentId];
        tournament.id = tournamentId;
        tournament.participants = _participantIds;
        tournament.createdAt = block.timestamp;
        tournament.isCompleted = false;
        
        // Initialize scores to 0
        for (uint256 i = 0; i < _participantIds.length; i++) {
            tournament.scores[_participantIds[i]] = 0;
        }
        
        emit TournamentCreated(tournamentId, _participantIds.length);
        
        return tournamentId;
    }

    /**
     * @dev Record tournament results
     * @param _tournamentId The ID of the tournament
     * @param _scores Mapping of genome IDs to scores
     */
    function recordTournamentResults(
        bytes32 _tournamentId,
        bytes32[] memory _genomeIds,
        uint256[] memory _scores
    ) external onlyAuthorized {
        GenomeTournament storage tournament = genomeTournaments[_tournamentId];
        require(!tournament.isCompleted, "Tournament already completed");
        require(_genomeIds.length == _scores.length, "Mismatched arrays");
        
        // Record scores
        for (uint256 i = 0; i < _genomeIds.length; i++) {
            tournament.scores[_genomeIds[i]] = _scores[i];
        }
        
        tournament.completedAt = block.timestamp;
        tournament.isCompleted = true;
        
        // Find winner
        bytes32 winnerId = _genomeIds[0];
        uint256 winnerScore = _scores[0];
        
        for (uint256 i = 1; i < _genomeIds.length; i++) {
            if (_scores[i] > winnerScore) {
                winnerId = _genomeIds[i];
                winnerScore = _scores[i];
            }
        }
        
        emit TournamentCompleted(_tournamentId, winnerId, winnerScore);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Tournament Completed",
            collaborators,
            string(abi.encodePacked('{"tournamentId": "', vm.toString(_tournamentId), '"}')),
            string(abi.encodePacked('{"winnerId": "', vm.toString(winnerId), '", "winnerScore": ', vm.toString(winnerScore), '}')),
            '{"consciousness": "competitive-evolution"}',
            '{"state": "tournament-completed"}'
        );
    }

    /**
     * @dev Evolve a new strategy from a successful genome
     * @param _genomeId The ID of the genome to evolve into a strategy
     * @param _name The name of the strategy
     * @param _description The description of the strategy
     * @return bytes32 The ID of the evolved strategy
     */
    function evolveStrategy(
        bytes32 _genomeId,
        string memory _name,
        string memory _description
    ) external onlyAuthorized returns (bytes32) {
        StrategyGenome storage genome = strategyGenomes[_genomeId];
        require(genome.isActive, "Genome is not active");
        require(genome.fitness >= 700, "Genome fitness is too low");
        
        strategyCount++;
        bytes32 strategyId = keccak256(abi.encodePacked(_name, strategyCount, block.timestamp));
        
        EvolvedStrategy storage strategy = evolvedStrategies[strategyId];
        strategy.strategyId = strategyId;
        strategy.genomeId = _genomeId;
        strategy.name = _name;
        strategy.description = _description;
        strategy.deploymentTimestamp = block.timestamp;
        strategy.isActive = true;
        
        emit StrategyEvolved(strategyId, _genomeId, _name);
        
        // Send intent to deploy the strategy
        _sendDeploymentIntent(strategyId, _name, _description);
        
        return strategyId;
    }

    /**
     * @dev Record deployment of an evolved strategy
     * @param _strategyId The ID of the strategy
     * @param _deploymentAddress The address where the strategy was deployed
     */
    function recordDeployment(bytes32 _strategyId, address _deploymentAddress) external onlyAuthorized {
        EvolvedStrategy storage strategy = evolvedStrategies[_strategyId];
        require(strategy.isActive, "Strategy is not active");
        
        strategy.deploymentAddress = _deploymentAddress;
        strategy.performanceScore = 500; // Initial score
        
        emit StrategyDeployed(_strategyId, _deploymentAddress);
    }

    /**
     * @dev Update performance score of a deployed strategy
     * @param _strategyId The ID of the strategy
     * @param _performanceScore The new performance score (0-1000)
     */
    function updatePerformanceScore(bytes32 _strategyId, uint256 _performanceScore) external onlyAuthorized {
        EvolvedStrategy storage strategy = evolvedStrategies[_strategyId];
        require(strategy.isActive, "Strategy is not active");
        require(strategy.deploymentAddress != address(0), "Strategy not deployed");
        
        strategy.performanceScore = _performanceScore;
    }

    /**
     * @dev Send deployment intent to IntentBus
     * @param _strategyId The ID of the strategy
     * @param _name The name of the strategy
     * @param _description The description of the strategy
     */
    function _sendDeploymentIntent(
        bytes32 _strategyId,
        string memory _name,
        string memory _description
    ) internal {
        // In a real implementation, this would interact with the IntentBus contract
        // For now, we'll just log that it would happen
        // IntentBus(intentBusAddress).postIntent(...);
    }

    /**
     * @dev Get strategy genome
     * @param _genomeId The ID of the genome
     * @return StrategyGenome struct
     */
    function getStrategyGenome(bytes32 _genomeId) external view returns (StrategyGenome memory) {
        return strategyGenomes[_genomeId];
    }

    /**
     * @dev Get test result
     * @param _resultId The ID of the test result
     * @return TestResult struct
     */
    function getTestResult(uint256 _resultId) external view returns (TestResult memory) {
        return testResults[_resultId];
    }

    /**
     * @dev Get evolved strategy
     * @param _strategyId The ID of the strategy
     * @return EvolvedStrategy struct
     */
    function getEvolvedStrategy(bytes32 _strategyId) external view returns (EvolvedStrategy memory) {
        return evolvedStrategies[_strategyId];
    }

    /**
     * @dev Get genome lineage
     * @param _genomeId The ID of the genome
     * @return Array of child genome IDs
     */
    function getGenomeLineage(bytes32 _genomeId) external view returns (bytes32[] memory) {
        return genomeLineage[_genomeId];
    }

    /**
     * @dev Get genome tournament
     * @param _tournamentId The ID of the tournament
     * @return GenomeTournament struct
     */
    function getGenomeTournament(bytes32 _tournamentId) external view returns (GenomeTournament memory) {
        return genomeTournaments[_tournamentId];
    }
}