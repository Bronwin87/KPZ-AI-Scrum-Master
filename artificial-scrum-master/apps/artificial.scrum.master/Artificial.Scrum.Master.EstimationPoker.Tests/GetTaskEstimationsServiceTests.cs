using Artificial.Scrum.Master.EstimationPoker.Features.GetTaskEstimations;
using Artificial.Scrum.Master.EstimationPoker.Features.Shared.Exceptions;
using Artificial.Scrum.Master.EstimationPoker.Infrastructure.Models;
using Artificial.Scrum.Master.EstimationPoker.Infrastructure.Repositories;
using Artificial.Scrum.Master.Interfaces;
using FluentAssertions;
using NSubstitute;

namespace Artificial.Scrum.Master.EstimationPoker.Tests;

public class GetTaskEstimationsServiceTests
{
    private GetTaskEstimationsService _sut;
    private ISessionTaskRepository _sessionTaskRepository;
    private ISessionRepository _sessionRepository;
    private IUserAccessor _userAccessor;

    [SetUp]
    public void SetUp()
    {
        _sessionTaskRepository = Substitute.For<ISessionTaskRepository>();
        _sessionRepository = Substitute.For<ISessionRepository>();
        _userAccessor = Substitute.For<IUserAccessor>();
        _sut = new GetTaskEstimationsService(_sessionTaskRepository, _sessionRepository, _userAccessor);
    }

    [Test]
    public async Task Handle_WhenUserIsNotAuthenticatedDoesNotExist_ReturnsException()
    {
        // Arrange
        var taskId = 1;
        _userAccessor.UserId.Returns("");

        // Act
        var result = await _sut.Handle(taskId);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Exception.Should().BeOfType<UnauthorizedAccessException>();
    }

    [Test]
    public async Task Handle_WhenTaskDoesNotExist_ReturnsException()
    {
        // Arrange
        var taskId = 1;
        _userAccessor.UserId.Returns("user1");
        _sessionTaskRepository.GetTaskById(taskId).Returns((SessionTaskEntity?)null);

        // Act
        var result = await _sut.Handle(taskId);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Exception.Should().BeOfType<TaskNotFoundException>();
    }

    [Test]
    public async Task Handle_WhenTaskExistUserIsNotOwnerOfSession_ReturnsException()
    {
        // Arrange
        var taskId = 1;
        _userAccessor.UserId.Returns("user1");
        _sessionTaskRepository.GetTaskById(taskId).Returns(new SessionTaskEntity());
        _sessionTaskRepository.GetTaskEstimations(taskId).Returns([]);
        _sessionRepository.ValidateUserAccess("user1", "session1").Returns(false);

        // Act
        var result = await _sut.Handle(taskId);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Exception.Should().BeOfType<UserNotAuthorizedException>();
    }

    [Test]
    public async Task Handle_WhenTaskExistButThereAreNoEstimations_ShouldReturnEmptyListAndZeroAverage()
    {
        // Arrange
        var taskId = 1;
        _userAccessor.UserId.Returns("user1");
        _sessionTaskRepository.GetTaskById(taskId).Returns(new SessionTaskEntity("session1", default!, default!, default!));
        _sessionTaskRepository.GetTaskEstimations(taskId).Returns([]);
        _sessionRepository.ValidateUserAccess("user1", "session1").Returns(true);
        var expectedResult = new GetTaskEstimationsResponse([], 0);

        // Act
        var result = await _sut.Handle(taskId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Error.Should().BeNull();
        result.Value.Should().BeEquivalentTo(expectedResult);
    }

    [Test]
    [TestCase(2, 1, 1.5)]
    [TestCase(3, 2, 2.5)]
    [TestCase(5, 8, 6.5)]
    [TestCase(7, 7, 7)]
    [TestCase(8, 10, 9)]
    public async Task Handle_WhenTaskExists_ReturnsValidResult(decimal estimation1, decimal estimation2, decimal expectedAverage)
    {
        // Arrange
        var taskId = 1;
        _userAccessor.UserId.Returns("user1");
        _sessionTaskRepository.GetTaskById(taskId).Returns(new SessionTaskEntity(
            "session1", "Task", "Des", DateTime.MinValue)
        {
            Id = taskId
        });
        _sessionRepository.ValidateUserAccess("user1", "session1").Returns(true);
        _sessionTaskRepository.GetTaskEstimations(taskId).Returns(
        [
            new(taskId, "user1", estimation1),
            new(taskId, "user2", estimation2)
        ]);
        var expectedResult = new GetTaskEstimationsResponse(
        [
            new(taskId, "user1", estimation1),
            new(taskId, "user2", estimation2)
        ], expectedAverage);

        // Act
        var result = await _sut.Handle(taskId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResult);
        result.Error.Should().BeNull();
    }
}
